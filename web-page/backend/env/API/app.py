from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, HTTPException, File
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, FileResponse
import os
import tempfile
import shutil
from pydantic import BaseModel
from PIL import Image

temp_dir = tempfile.mkdtemp()  # Global variable to store the temporary directory path

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
    """returns the mask of specified layer id
    Args:
        layer_id (int): id of mask, based on layer

    Raises:
        HTTPException: when mask was not found
    """
    try:
        return FileResponse(os.path.join(temp_dir, f"{layer_id}.png"))
    except:
        raise HTTPException(status_code=400, detail="Image not found")


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

    img1 = Image.open("web-page/frontend/src/assets/house.jpg")
    img2 = Image.open("web-page/frontend/src/assets/luffy.jpg")
    img2 = img2.convert("RGBA")

    img1.paste(img2, (0,0), mask = img2)
    img1.save("web-page/frontend/src/assets/downloadable.png")
    return FileResponse("web-page/frontend/src/assets/downloadable.png", media_type="image/png")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", reload=True, port=8000)
