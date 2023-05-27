from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import tempfile
import shutil

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

temp_dir = None  # Global variable to store the temporary directory path

# Post api for the image
'''This statement does the following:
1. Generates a HTTP exception (400) if the image is not provided
2. Creates a temporary directory if its not created
3. Creates an image.jpg file in the temporary directory when the api is called by the frontend
4. Returns the file_path of the temporary directory when the api is called by the frontend'''
@app.post('/api/image')
async def upload_image(image: UploadFile = None):
    global temp_dir

    if image is None:
        raise HTTPException(status_code=400, detail='No image provided.')

    if temp_dir is None:  # Create temporary directory if not already created
        temp_dir = tempfile.mkdtemp()

    file_path = os.path.join(temp_dir, 'image.jpg')
    with open(file_path, 'wb') as file:
        file.write(await image.read())

    print(file_path)
    return {'message': 'Image uploaded successfully.', 'file_path': file_path}

# Post api cleanup
'''This statement errases the temporary directory when the page is shutdown using shutil.rmtree method.'''
@app.post('/api/cleanup')
def cleanup_temp_dir():
    global temp_dir
    if temp_dir is not None:
        shutil.rmtree(temp_dir)
        temp_dir = None
        return {'message': 'Temporary directory cleaned up.'}
    else:
        return {'message': 'No temporary directory to clean up.'}

if __name__ == '__main__':
    import uvicorn
    uvicorn.run('app:app', reload=True, port=8000)