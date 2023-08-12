import os
import torch
import onnxruntime
import numpy as np
import cv2
from segment_anything import sam_model_registry, SamPredictor
from typing import List, Dict, Literal
from PIL import Image
from logger import color_logger

logger = color_logger(__name__, "INFO")


## Defining the mask and the points
def show_mask(mask: list, ax, random_color=False):
    if random_color:
        color = np.concatenate([np.random.random(3), np.array([0.6])], axis=0)
    else:
        color = np.array([120 / 255, 100 / 255, 50 / 255, 0.6])
    h, w = mask.shape[-2:]
    mask_image = mask.reshape(h, w, 1) * color.reshape(1, 1, -1)
    ax.imshow(mask_image)


def show_points(coords: np.ndarray, labels: np.ndarray, ax, marker_size=200):
    pos_points = coords[labels == 1]
    neg_points = coords[labels == 0]
    ax.scatter(
        pos_points[:, 0],
        pos_points[:, 1],
        color="green",
        marker=".",
        s=marker_size,
        edgecolor="white",
        linewidth=1,
    )
    ax.scatter(
        neg_points[:, 0],
        neg_points[:, 1],
        color="red",
        marker=".",
        s=marker_size,
        edgecolor="white",
        linewidth=1,
    )


def get_torch_device(model_type: Literal["vit_b", "vit_l", "vit_h"]) -> torch.device:
    """Creates a torch device to run the model. If gpu is available, memory
    is evaluated for given model. Defaults to cpu

    Args:
        model_type (str): sam model type

    Returns:
        torch.device: device to run embedding generation
    """
    if torch.cuda.is_available():
        # clean cuda cache
        torch.cuda.empty_cache()
        # only load model into gpu if there is enough memoery
        device = torch.device("cuda")
        device_properties = torch.cuda.get_device_properties(device)
        available_memory = (
            device_properties.total_memory - torch.cuda.max_memory_allocated()
        ) / (1024**3)
        if model_type == "vit_b" and available_memory >= 2.0:
            return device
        elif model_type == "vit_l" and available_memory >= 6.0:
            return device
        elif model_type == "vit_h" and available_memory >= 11.0:
            return device
        else:
            logger.error(
                "Your GPU doesn't have enough memory to load desired model. Defaulting to cpu"
            )
    return torch.device("cpu")


def create_sam(type: str, checkpoint_path: str):
    """Initializes the SAM model"""
    device = get_torch_device(type)
    sam = sam_model_registry[type](checkpoint=checkpoint_path)
    sam.to(device=device)
    return sam


## Generating the final mask
def predict_mask(
    input_point: np.ndarray,
    input_label: np.ndarray,
    predictor: SamPredictor,
    image_embedding: np.ndarray,
    ort_session: onnxruntime,
    img: np.ndarray,
) -> np.ndarray:
    """Uses the model over some given points to generate a chosen mask given the input data."""

    onnx_coord = np.concatenate([input_point, np.array([[0.0, 0.0]])], axis=0)[
        None, :, :
    ]
    onnx_label = np.concatenate([input_label, np.array([-1])], axis=0)[None, :].astype(
        np.float32
    )

    onnx_coord = predictor.transform.apply_coords(onnx_coord, img.shape[:2]).astype(
        np.float32
    )  ## ok

    onnx_mask_input = np.zeros((1, 1, 256, 256), dtype=np.float32)
    onnx_has_mask_input = np.ones(1, dtype=np.float32)

    ort_inputs = {
        "image_embeddings": image_embedding,
        "point_coords": onnx_coord,
        "point_labels": onnx_label,
        "mask_input": onnx_mask_input,
        "has_mask_input": onnx_has_mask_input,
        "orig_im_size": np.array(img.shape[:2], dtype=np.float32),
    }

    masks, _, _ = ort_session.run(None, ort_inputs)
    masks = masks > predictor.model.mask_threshold
    return masks


def gen_new_mask(
    img: np.ndarray,
    points: List[List[int]],
    predictor: SamPredictor,
    image_embedding: np.ndarray,
    ort_session: onnxruntime,
) -> Image:
    """Creates a new mask Image from input points and predictor model
    Args:
        img (np.ndarray): input image
        points (List[List[int]]): points for model
        predictor (SamPredictor): predictor with image embeddings already loaded
        image_embedding (np.ndarray): representation of the image processed by the model
        ort_session (ort_session): onnx inference session, so the model is submited only once.
    """
    # coord transforming
    points_arr = np.array(points)
    points = points_arr[:, :2]
    labels = points_arr[:, -1]

    mask_img = np.zeros_like(img, dtype=np.uint8)
    # si no hay puntos, la máscara es una imagen completamente transparente
    if len(points) == 0:
        mask_img = Image.fromarray(mask_img)
        mask_img.putalpha(0)
        return mask_img

    mask = predict_mask(points, labels, predictor, image_embedding, ort_session, img)
    mask = mask[0, 0, :, :]
    mask_img[mask] = img[mask]
    alpha_channel = np.zeros(img.shape[:2], dtype=np.uint8)
    alpha_channel[mask] = 255
    mask_img = Image.fromarray(mask_img)
    mask_img.putalpha(Image.fromarray(alpha_channel))
    contours = compute_mask_contour(alpha_channel)
    return mask_img, contours


def update_stored_mask(
    layer_id: int,
    img: np.ndarray,
    predictor: SamPredictor,
    layer_coords: Dict[str, List],
    mask_dir: str,
    image_embedding: np.ndarray,
    ort_session: onnxruntime,
):
    """Update stored mask for specific layer based on input points

    Args:
        layer_id (int): id of layer
        img (np.ndarray): image input for model
        predictor (SamPredictor): predictor with image embeddings already loaded
        layer_coords (Dict[str, List]): points for all layers
        mask_dir (str): _description_
        image_embedding (np_ndarray):
        ort_session (onnxruntime):
    """
    points = layer_coords.get(layer_id, None)
    # layer doesn't have points assigned
    if points is None:
        return
    # pointer will return 0 points
    if points["pointer"] == 0:
        return
    effective_points = points["points"][: points["pointer"]]
    # create new mask
    mask_img, contours = gen_new_mask(
        img, effective_points, predictor, image_embedding, ort_session
    )
    np.save(os.path.join(mask_dir, f"{layer_id}_cnt.npy"), contours, allow_pickle=True)
    # update mask by overwriting stored image
    mask_img.save(os.path.join(mask_dir, f"{layer_id}.png"))


def compute_mask_contour(mask: np.ndarray) -> np.ndarray:
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    normalized_contours = []
    for cnt in contours:
        if len(cnt) < 3:
            continue
        cnt = cnt.squeeze()
        xx, yy = cnt[:, 0], cnt[:, 1]
        xx = xx / mask.shape[1]
        yy = yy / mask.shape[0]
        normalized_contours.append(np.stack([xx, yy], axis=1).flatten())

    return np.array(normalized_contours, dtype=object)


def load_mask_contour(layer_id: int, mask_dir: str) -> List[int]:
    pts: np.ndarray = np.load(
        os.path.join(mask_dir, f"{layer_id}_cnt.npy"), allow_pickle=True
    )
    pts = [cnt.tolist() for cnt in pts]
    return pts
