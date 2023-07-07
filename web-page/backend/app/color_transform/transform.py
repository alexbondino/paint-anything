"""
This module handles the computation side of color transformation operations over images and 
their respective masks. 
-- jsmithdlc
"""

import cv2
import numpy as np
import matplotlib.pyplot as plt
from typing import Tuple


def __extract_hls_from_rgb(rgb_img: np.ndarray) -> Tuple[np.ndarray]:
    hls_img = cv2.cvtColor(rgb_img, cv2.COLOR_RGB2HLS)
    return cv2.split(hls_img)


def hsl_cv2_2_js(hue: int, saturation: int, lightness: int):
    """
    Converts from opencv HSL range [0-180,0-255,0-255] to javascript HSL range [0-360, 0-100,0-100]
    """
    return hue / 180 * 360, saturation / 255 * 100, lightness / 255 * 100


def extract_median_h_sat(
    rgb_img: np.ndarray, roi_mask: np.ndarray = []
) -> Tuple[int, int]:
    """Extracts median hue and saturation values from RGB image. Can also receive a
    mask, of the same dim than input img, to mask only relevant pixels

    Args:
        rgb_img (np.ndarray): RGB image to extract values from.
        roi_mask (np.array, optional): boolean mask of the same size as rgb_img that
        specifies the area to extract the median values from. If None, uses entire image. Defaults to None.

    Returns:
        Tuple[int, int]: median hue and median saturation
    """
    h, _, s = __extract_hls_from_rgb(rgb_img)
    if len(roi_mask) == 0:
        return np.median(h), np.median(s)
    return np.median(h[roi_mask]), np.median(s[roi_mask])


def replace_mask_color(
    rgb_img: np.ndarray, mask: np.ndarray, new_h: int, new_s: int, l_shift: int
) -> np.ndarray:
    """Replaces a zone of the input image, indicated by mask, by the given hue and
    saturation values, while shifting the lightness.

    Args:
        rgb_img (np.ndarray): RGB image to be transformed.
        mask (np.ndarray): boolean mask of the same size as rgb_img that specifies
        the area to extract the median values from.
        new_h (int): new hue value
        new_s (int): new saturation value
        l_shift (int): image lightness will be shifted by this value

    Returns:
        np.ndarray: transformed rgb image
    """
    h, l, s = __extract_hls_from_rgb(rgb_img)
    h[mask] = new_h
    l[mask] += l_shift
    l = np.clip(l, 0, 255)
    s[mask] = new_s
    new_img = cv2.cvtColor(cv2.merge([h, l, s]), cv2.COLOR_HLS2RGB)
    return new_img


if __name__ == "__main__":
    img = cv2.imread("src/color_transform/samples/house_2.jpg")
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    mask = cv2.imread(
        "src/color_transform/samples/house_2_mask.png", cv2.IMREAD_UNCHANGED
    )
    mask = mask[:, :, -1] > 0
    fig = plt.figure(figsize=(12, 12))
    plt.imshow(replace_mask_color(img, mask, 50, 10, 0))
    plt.show()
