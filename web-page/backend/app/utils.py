import os
import re
import numpy as np
from PIL import Image


def clean_mask_files(mask_dir: str):
    """Erases all mask files from disk"""
    files = [file for file in os.listdir(mask_dir) if re.search(r"\d+\.png", file)]
    for file in files:
        os.remove(os.path.join(mask_dir, file))


def load_image(img_path: str) -> np.array:
    """loads rgb image from path as numpy array"""
    img = Image.open(img_path).convert("RGB")
    img = np.array(img)
    return img
