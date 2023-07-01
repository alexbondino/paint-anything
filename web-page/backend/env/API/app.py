from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, HTTPException, File, Request
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, FileResponse
import os
import tempfile
import shutil
from pydantic import BaseModel
from PIL import Image

current_dir = os.path.dirname(os.path.abspath(__file__))

temp_dir = tempfile.mkdtemp()  # Global variable to store the temporary directory path

layer_selected = 0
positive_layer_coords = {}
negative_layer_coords = {}


class PointAndClickXData(BaseModel):
    x_coord: int
    y_coord: int


class SelectedLayer(BaseModel):
    layerId: int


class NegPointAndClickData(BaseModel):
    x_coord: int
    y_coord: int


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


# Get image
@app.get("/api/image")
async def get_image():
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

    return {"message": "Image uploaded successfully."}


@app.get("/api/fetch-mask")
async def fetch_mask(layer_id: int):
    """returns the mask of specified layer id"""
    try:
        return FileResponse(os.path.join(temp_dir, f"{layer_id}.png"))
    except:
        raise HTTPException(status_code=400, detail="Image not found")


@app.get("/api/delete-mask")
async def delete_mask(layer_id: int):
    """Deletes mask associated to specified layer id"""
    try:
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
async def image_downloader():
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


@app.post("/api/point_&_click")
def point_and_click(data: PointAndClickXData):
    x_coord = data.x_coord
    y_coord = data.y_coord
    if layer_selected in positive_layer_coords:
        positive_layer_coords[layer_selected].append([x_coord, y_coord])
    elif layer_selected not in positive_layer_coords:
        positive_layer_coords[layer_selected] = [[x_coord, y_coord]]
    print("el layer seleccionado es: ", layer_selected)
    print("los puntos positivos son: ", positive_layer_coords[layer_selected])

    return {"message": f"Coordenadas pasadas correctamente: {x_coord} {y_coord}"}


@app.post("/api/selected_layer")
def selected_layer(data: SelectedLayer):
    global layer_selected
    layerId = data.layerId
    layer_selected = layerId
    return {"message": f"{layerId}"}


@app.post("/api/neg_point_&_click")
def neg_point_and_click(data: NegPointAndClickData):
    x_coord = data.x_coord
    y_coord = data.y_coord
    if layer_selected in negative_layer_coords:
        negative_layer_coords[layer_selected].append([x_coord, y_coord])
    elif layer_selected not in negative_layer_coords:
        negative_layer_coords[layer_selected] = [[x_coord, y_coord]]

    print("el layer seleccionado es: ", layer_selected)
    print("los puntos negativos son: ", negative_layer_coords[layer_selected])
    return {"message": f"Coordenadas pasadas correctamente: {x_coord} {y_coord}"}


@app.post("/api/delete_point_&_click")
def delete_point_and_click(data: SelectedLayer):
    global negative_layer_coords
    global positive_layer_coords
    layerId = data.layerId
    if layerId in negative_layer_coords or layerId in positive_layer_coords:
        del negative_layer_coords[layerId]
        del positive_layer_coords[layerId]
    return {"message": f"Coordenadas eliminadas correctamente: {layerId}"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", reload=True, port=8000)
