import numpy as np
from PIL import Image


def load_image(img_path: str) -> np.array:
    """loads rgb image from path as numpy array"""
    img = Image.open(img_path).convert("RGB")
    img = np.array(img)
    return img
