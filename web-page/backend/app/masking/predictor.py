import numpy as np
import os
from segment_anything import sam_model_registry, SamAutomaticMaskGenerator, SamPredictor
import torch
from typing import List, Dict
from PIL import Image

# use gpu if available
device = torch.device(
    "cuda"
    if torch.cuda.is_available() and torch.cuda.mem_get_info()[0] / (10**9) >= 5.0
    else "cpu"
)


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


def create_sam(type: str, checkpoint_path: str):
    """Initializes the SAM model"""
    sam = sam_model_registry[type](checkpoint=checkpoint_path)
    sam.to(device=device)
    return sam


## Generating the final mask
def predict_mask(
    input_point: np.ndarray, input_label: np.ndarray, predictor: SamPredictor
) -> np.ndarray:
    """Uses the model over some given points to generate a chosen mask given the input data."""
    # first pass
    _, pre_scores, pre_logits = predictor.predict(
        point_coords=input_point,
        point_labels=input_label,
        multimask_output=True,
    )
    mask_input = pre_logits[np.argmax(pre_scores), :, :]
    # second and final pass
    mask, _, _ = predictor.predict(
        point_coords=input_point,
        point_labels=input_label,
        mask_input=mask_input[None, :, :],
        multimask_output=False,
    )
    mask = mask.squeeze()
    return mask


def gen_new_mask(
    img: np.ndarray,
    positive_points: List[List[int]],
    negative_points: List[List[int]],
    predictor: SamPredictor,
) -> Image:
    """Creates a new mask Image from input points and predictor model

    Args:
        img (np.ndarray): input image
        positive_points (List[List[int]]): positive points for model
        negative_points (List[List[int]]): negative points for model
        predictor (SamPredictor): predictor with image embeddings already loaded

    Returns:
        Image: new mask
    """
    points = np.array(positive_points + negative_points)
    input_label = np.array([1] * len(positive_points) + [0] * len(negative_points))
    mask = predict_mask(points, input_label, predictor)
    mask_img = np.zeros(img.shape, dtype=np.uint8)
    mask_img[mask] = img[mask]
    alpha_channel = np.zeros(img.shape[:2], dtype=np.uint8)
    alpha_channel[mask] = 255
    mask_img = Image.fromarray(mask_img)
    mask_img.putalpha(Image.fromarray(alpha_channel))
    return mask_img


def update_stored_mask(
    layer_id: int,
    img: np.ndarray,
    predictor: SamPredictor,
    positive_layer_coords: Dict[str, List],
    negative_layer_coords: Dict[str, List],
    mask_dir: str,
):
    """Update stored mask for specific layer based on input points

    Args:
        layer_id (int): id of layer
        img (np.ndarray): image input for model
        predictor (SamPredictor): predictor with image embeddings already loaded
        positive_layer_coords (Dict[str, List]): positive points of all layers
        negative_layer_coords (Dict[str, List]): negative points of all layers
        mask_dir (str): _description_
    """
    positive_points = positive_layer_coords.get(layer_id, [])
    negative_points = negative_layer_coords.get(layer_id, [])
    # create new mask
    mask_img = gen_new_mask(img, positive_points, negative_points, predictor)
    # update mask by overwriting stored image
    mask_img.save(os.path.join(mask_dir, f"{layer_id}.png"))
