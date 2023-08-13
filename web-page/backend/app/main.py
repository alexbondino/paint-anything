import os
import tempfile
import shutil
import numpy as np
import onnxruntime
import torch
from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from typing import Literal
from pydantic import BaseModel, Field
from segment_anything import SamPredictor
from PIL import Image
from masking.predictor import create_sam, update_stored_mask, load_mask_contour
from utils import load_image, clean_mask_files
from color_transform.transform import extract_median_hsl, hsl_cv2_2_js
from logger import color_logger

logger = color_logger(__name__, "INFO")

current_dir = os.path.dirname(os.path.abspath(__file__))

temp_dir = tempfile.mkdtemp()  # Global variable to store the temporary directory path

# layer vars
layer_coords = {}

# image to edit and corresponding embedding
img = None
image_embedding = None

# segment anything model
ort_session = None
predictor = None


class Layer(BaseModel):
    layerId: int


class PointAndClickData(BaseModel):
    layer_id: int = Field(description="Specifies layer id of point and click")
    x_coord: float = Field(
        description="Point x-coordinate, as ratio of total image width", ge=0.0, le=1.0
    )
    y_coord: float = Field(
        description="Point y-coordinate, as ratio of total image height", ge=0.0, le=1.0
    )
    type: Literal[0, 1] = Field(
        description="Point type, 0 for negative and 1 for positive"
    )


class LayerPointer(BaseModel):
    layer_id: int = Field(description="Specifies layer id of point and click")
    pointer: int = Field(
        description="Pointer to last point to use for mask gen. It's one-indexed"
    )


class ModelSelection(BaseModel):
    model: str


app = FastAPI()

## CORS dependencies
origins = [
    "http://localhost",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["POST"],
    allow_headers=["*"],
)


def reset_points():
    global layer_coords
    layer_coords = {}


def set_new_img(img_path: str) -> SamPredictor:
    global img, image_embedding
    logger.info("-> generating embeddings for base image ...")
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
    img = load_image(img_path)
    predictor.set_image(img)
    image_embedding = predictor.get_image_embedding().detach().cpu().numpy()
    logger.info("-> embeddings generated")


def delete_points(layer_id: int):
    layer_coords.pop(layer_id, None)


# Get image
@app.get("/api/image")
def get_image():
    """
    Gets image from temp_dir. If there's no image, ErrorException will
    rise.

    Rises:
        HTTPException: HTTP Not Found (404) if the image is not provided.

    Returns: image
    """
    if temp_dir is None:
        raise HTTPException(status_code=404, detail="Image not found")
    file_path = os.path.join(temp_dir, "image.jpg")

    return {"message": "Obtained image succesfully.", "file_path": file_path}


# Post api for the image
@app.post("/api/image")
async def upload_image(image: UploadFile = None):
    """Triggers the creation of a temporary directory and an image.jpg file inside it.

    Args:
        image (UploadFile, optional): Image given by the frontend. If None is passed, ErrorException will rise.
        Defaults to None.

    Raises:
        HTTPException: HTTP exception (400) if the image is not provided.

    Returns:
        dict: File_path of the temporary directory when the api is called by the frontend
    """
    if image is None:
        raise HTTPException(status_code=400, detail="No image provided.")
    file_path = os.path.join(temp_dir, "image.jpg")
    with open(file_path, "wb") as file:
        file.write(await image.read())
    if img is not None:
        reset_points()
        clean_mask_files(temp_dir)
    set_new_img(file_path)
    return {"message": "Image uploaded successfully."}


@app.get("/api/mask-base-hsl")
def mask_base_hsl(layer_id: int):
    """returns the mask base hsl values"""
    img = np.array(Image.open(os.path.join(temp_dir, f"{layer_id}.png")))
    mask = img[:, :, -1] > 0
    hue, saturation, lightness = extract_median_hsl(img, mask)
    hue, saturation, lightness = hsl_cv2_2_js(hue, saturation, lightness)
    return {"hsl": [int(hue), int(saturation), int(lightness)]}


@app.get("/api/mask-img")
def fetch_mask(layer_id: int):
    """returns the mask of specified layer id"""
    try:
        return FileResponse(os.path.join(temp_dir, f"{layer_id}.png"))
    except:
        raise HTTPException(status_code=400, detail="Image not found")


@app.get("/api/mask-contour")
def fetch_contour(layer_id: int):
    """returns the contour of the mask from given layer_id"""
    contour = load_mask_contour(layer_id, temp_dir)
    return contour


@app.get("/api/delete-mask")
def delete_mask(layer_id: int):
    """Deletes mask associated to specified layer id"""
    try:
        delete_points(layer_id)
        os.remove(os.path.join(temp_dir, f"{layer_id}.png"))
        return {"message": "file successfully deleted"}
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="layer mask file not found")


@app.post("/api/cleanup")
def cleanup():
    global temp_dir
    clean_mask_files(temp_dir)
    reset_points()
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
    if temp_dir is not None:
        shutil.rmtree(temp_dir)
        temp_dir = tempfile.mkdtemp()
        return {"message": "Temporary directory cleaned up."}
    else:
        return {"message": "No temporary directory to clean up."}


@app.post("/api/point_&_click")
def point_and_click(data: PointAndClickData):
    layer_id = data.layer_id
    # coordinates transformed to real image coordinates. This resets a 5 pixel offset
    # established in frontend
    new_point = [
        min(data.x_coord * img.shape[1] + 5, img.shape[1]),
        min(data.y_coord * img.shape[0] + 5, img.shape[0]),
        data.type,
    ]
    if layer_id in layer_coords:
        layer_data = layer_coords[layer_id]
        # continue adding points from where pointer is at
        layer_coords[layer_id]["points"] = layer_coords[layer_id]["points"][
            : layer_data["pointer"]
        ]
        layer_coords[layer_id]["points"].append(new_point)
        # increase pointer
        layer_coords[layer_id]["pointer"] += 1
    else:
        # new layer
        layer_coords[layer_id] = {"points": [new_point], "pointer": 1}
    update_stored_mask(
        layer_id,
        img,
        predictor,
        layer_coords,
        temp_dir,
        image_embedding,
        ort_session,
    )
    return {"message": f"Coordenadas pasadas correctamente: {new_point}"}


@app.post("/api/move-pointer")
def move_layer_pointer(layer_pointer: LayerPointer):
    logger.debug(f"new pointer: {layer_pointer.pointer}")
    layer_id = layer_pointer.layer_id
    layer_coords[layer_id]["pointer"] = layer_pointer.pointer
    update_stored_mask(
        layer_id, img, predictor, layer_coords, temp_dir, image_embedding, ort_session
    )
    return {"message": "layer pointer moved successfully"}


@app.post("/api/model-selected")
def model_selected(data: ModelSelection):
    global predictor, ort_session
    match data.model:
        case "large_model":
            quantized_path = "./assets/vit_l_quantized.onnx"
            model_type = "vit_l"
            model_path = "./assets/sam_vit_l_0b3195.pth"
        case "huge_model":
            quantized_path = "./assets/vit_h_quantized.onnx"
            model_type = "vit_h"
            model_path = "./assets/sam_vit_h_4b8939.pth"
        case "base_model":
            quantized_path = "./assets/vit_b_quantized.onnx"
            model_type = "vit_b"
            model_path = "./assets/sam_vit_b_01ec64.pth"
    ort_session = onnxruntime.InferenceSession(quantized_path)
    predictor = SamPredictor(create_sam(model_type, model_path))
    return {"message": "model selected successfuly"}
