from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import os
import tempfile
import shutil
from pydantic import BaseModel, Field
from masking.predictor import create_sam, update_stored_mask
from utils import load_image
from color_transform.transform import extract_median_h_sat, hsl_cv2_2_js
from segment_anything import SamPredictor
from PIL import Image, ImageDraw
import numpy as np

current_dir = os.path.dirname(os.path.abspath(__file__))

temp_dir = tempfile.mkdtemp()  # Global variable to store the temporary directory path

# layer vars
layer_selected = 0
positive_layer_coords = {}
negative_layer_coords = {}

# image to edit
img = None

# segment anything model
print("-> loading sam predictor")
predictor = SamPredictor(create_sam("vit_b", "./assets/sam_vit_b_01ec64.pth"))
print("-> sam predictor successfully loaded")


class Layer(BaseModel):
    layerId: int


class PointAndClickData(BaseModel):
    x_coord: float = Field(
        description="Point x-coordinate, as ratio of total image width", ge=0.0, le=1.0
    )
    y_coord: float = Field(
        description="Point y-coordinate, as ratio of total image height", ge=0.0, le=1.0
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


def set_new_img(img_path: str) -> SamPredictor:
    global img
    print("-> generating embeddings for base image ...")
    img = load_image(img_path)
    predictor.set_image(img)
    print("-> embeddings generated")


def delete_points(layer_id: int):
    global negative_layer_coords
    global positive_layer_coords
    positive_layer_coords.pop(layer_id, None)
    negative_layer_coords.pop(layer_id, None)
    return {"message": f"Coordenadas eliminadas correctamente: {layer_id}"}


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
def cleanup_temp_dir():
    global temp_dir
    if temp_dir is not None:
        shutil.rmtree(temp_dir)
        temp_dir = tempfile.mkdtemp()
        return {"message": "Temporary directory cleaned up."}
    else:
        return {"message": "No temporary directory to clean up."}


@app.get("/api/image_downloader")
def image_downloader():
    from PIL import Image

    # Relative Paths must be changed in future to adapt to layers. As we are not generating images as layers yet
    # this will remain still.

    relative_path = os.path.dirname(current_dir)
    relative_path = os.path.dirname(relative_path)
    relative_path = os.path.dirname(relative_path)
    relative_path = os.path.join(relative_path, "frontend", "src", "assets")

    print(relative_path)

    img1 = Image.open(os.path.join(relative_path, "house.jpg"))
    img2 = Image.open(os.path.join(relative_path, "luffy.jpg"))
    img2 = img2.convert("RGBA")

    img1.paste(img2, (0, 0), mask=img2)
    img1.save(os.path.join(relative_path, "downloadable.png"))
    return FileResponse(
        os.path.join(relative_path, "downloadable.png"), media_type="image/png"
    )


@app.post("/api/selected_layer")
def set_selected_layer(data: Layer):
    global layer_selected
    layerId = data.layerId
    layer_selected = layerId
    return {"message": f"{layerId}"}


@app.post("/api/point_&_click")
def point_and_click(data: PointAndClickData):
    # coordinates must be transformed to real image coordinates
    new_point = [data.x_coord * img.shape[1], data.y_coord * img.shape[0]]
    if layer_selected in positive_layer_coords:
        positive_layer_coords[layer_selected].append(new_point)
    else:
        positive_layer_coords[layer_selected] = [new_point]
    print("el layer seleccionado es: ", layer_selected)
    print("los puntos positivos son: ", positive_layer_coords[layer_selected])
    update_stored_mask(
        layer_selected,
        img,
        predictor,
        positive_layer_coords,
        negative_layer_coords,
        temp_dir,
    )
    return {"message": f"Coordenadas pasadas correctamente: {new_point}"}


@app.post("/api/neg_point_&_click")
def neg_point_and_click(data: PointAndClickData):
    # coordinates must be transformed to real image coordinates
    new_point = [data.x_coord * img.shape[1], data.y_coord * img.shape[0]]
    if layer_selected in negative_layer_coords:
        negative_layer_coords[layer_selected].append(new_point)
    else:
        negative_layer_coords[layer_selected] = [new_point]

    print("el layer seleccionado es: ", layer_selected)
    print("los puntos negativos son: ", negative_layer_coords[layer_selected])
    update_stored_mask(
        layer_selected,
        img,
        predictor,
        positive_layer_coords,
        negative_layer_coords,
        temp_dir,
    )
    return {"message": f"Coordenadas pasadas correctamente: {new_point}"}
