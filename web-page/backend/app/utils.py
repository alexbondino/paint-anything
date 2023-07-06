import os
import re
import numpy as np
from PIL import Image


def list_mask_files(mask_dir: str):
    return [file for file in os.listdir(mask_dir) if re.search(r"\d+\.png", file)]


def save_output(dir: str) -> str:
    """Saves edition output to disk"""
    img = load_image(os.path.join(dir, "image.jpg"))
    mask_files = list_mask_files(dir)
    for file in mask_files:
        mask = np.array(Image.open(os.path.join(dir, file)))
        mask_zone = mask[:, :, -1] > 0
        img[mask_zone] = mask[mask_zone][:, :3]
    output_path = os.path.join(dir, "output.png")
    Image.fromarray(img).save(output_path)
    return output_path


def clean_mask_files(mask_dir: str):
    """Erases all mask files from disk"""
    files = list_mask_files(mask_dir)
    for file in files:
        os.remove(os.path.join(mask_dir, file))


def load_image(img_path: str) -> np.array:
    """loads rgb image from path as numpy array"""
    img = Image.open(img_path).convert("RGB")
    img = np.array(img)
    return img
