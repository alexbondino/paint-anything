# Imagine-Houses

![Python 3.10](https://img.shields.io/badge/python-3.10-blue.svg)
![Node JS](https://img.shields.io/badge/nodejs-18.16-green.svg)

Project for easily visualizing color changes to objects inside images, house paintings, you name it!

## Setup

This project requires `python >= 3.8` and `Node.js 18` to work properly. We recommend using **python 3.10** and **Node.js 18.16**. If you don't have python in your computer, please install it from [here](https://www.python.org/downloads/release/python-3100/). Likewise, Node.js can be installed by following the instructions [here](https://nodejs.org/).

Clone this repo and open it

```bash
git clone https://github.com/alexbondino/imagine-houses.git
cd imagine-houses
```

Create a folder under `web-page/backend/app` named "assets", download the SAM files (including ONNX decoders) from this [google drive](https://drive.google.com/drive/folders/1JVL1oGfZWsSuO4RpmSOw2UKkNObsnVtn?usp=drive_link) and unzip them into this folder. Your assets folder should now look like this:

```python
── assets
   ├── sam_vit_b_01ec64.pth # base SAM model
   ├── sam_vit_l_0b3195.pth # large SAM model
   ├── sam_vit_h_4b8939.pth # huge SAM model
   ├── vit_b_quantized.onnx # base model ONNX mask decoder
   ├── vit_l_quantized.onnx # large model ONNX mask decoder
   └── vit_h_quantized.onnx # huge model ONNX mask decoder
```