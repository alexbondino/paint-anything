from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import os
import tempfile
import shutil
from typing import Literal
from pydantic import BaseModel, Field
from masking.predictor import create_sam, update_stored_mask
from utils import load_image, clean_mask_files, save_output
from color_transform.transform import extract_median_h_sat, hsl_cv2_2_js
from segment_anything import SamPredictor
from PIL import Image
import numpy as np

current_dir = os.path.dirname(os.path.abspath(__file__))

temp_dir = tempfile.mkdtemp()  # Global variable to store the temporary directory path

# layer vars
layer_coords = {}

# image to edit
img = None

# TODO: choose which SAM variant can be used
# segment anything model
print("-> loading sam predictor")
predictor = SamPredictor(create_sam("vit_b", "./assets/sam_vit_b_01ec64.pth"))
print("-> sam predictor successfully loaded")


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
    global img
    print("-> generating embeddings for base image ...")
    img = load_image(img_path)
    predictor.set_image(img)
    print("-> embeddings generated")


def delete_points(layer_id: int):
    print("deleting poinnnts")
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
    hue, saturation = extract_median_h_sat(img, mask)
    hue, saturation, _ = hsl_cv2_2_js(hue, saturation, 0)
    return {"hsl": [int(hue), int(saturation), 50]}


@app.get("/api/mask-img")
def fetch_mask(layer_id: int):
    """returns the mask of specified layer id"""
    try:
        return FileResponse(os.path.join(temp_dir, f"{layer_id}.png"))
    except:
        raise HTTPException(status_code=400, detail="Image not found")


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
    if temp_dir is not None:
        shutil.rmtree(temp_dir)
        temp_dir = tempfile.mkdtemp()
        return {"message": "Temporary directory cleaned up."}
    else:
        return {"message": "No temporary directory to clean up."}


@app.get("/api/image_downloader")
def image_downloader():
    output_path = save_output(temp_dir)
    return FileResponse(output_path, media_type="image/png")


@app.post("/api/point_&_click")
def point_and_click(data: PointAndClickData):
    # coordinates must be transformed to real image coordinates
    new_point = [data.x_coord * img.shape[1], data.y_coord * img.shape[0], data.type]
    if data.layer_id in layer_coords:
        layer_coords[data.layer_id].append(new_point)
    else:
        layer_coords[data.layer_id] = [new_point]
    print("el layer seleccionado es: ", data.layer_id)
    print("los puntos son: ", layer_coords[data.layer_id])
    update_stored_mask(
        data.layer_id,
        img,
        predictor,
        layer_coords,
        temp_dir,
    )
    return {"message": f"Coordenadas pasadas correctamente: {new_point}"}
