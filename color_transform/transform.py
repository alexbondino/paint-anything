import cv2
import numpy as np
import matplotlib.pyplot as plt


def __extract_hls_from_rgb(rgb_img: np.ndarray):
    hls_img = cv2.cvtColor(rgb_img, cv2.COLOR_RGB2HLS)
    return cv2.split(hls_img)


def extract_median_h_sat(rgb_img: np.ndarray, roi_mask: np.array = None):
    h, _, s = __extract_hls_from_rgb(rgb_img)
    if roi_mask == None:
        return np.median(h), np.median(s)
    return np.median(h[roi_mask]), np.median(s[roi_mask])


def replace_mask_color(
    rgb_img: np.ndarray, mask: np.ndarray, new_h: int, new_s: int, l_shift: int
):
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
