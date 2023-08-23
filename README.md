# Paint Anything

![Python 3.10](https://img.shields.io/badge/python-3.10-blue.svg)
![Node JS](https://img.shields.io/badge/nodejs-18.16-green.svg)

Change the color of anything with easy object selection using the novel [Segment Anything Model](https://github.com/facebookresearch/segment-anything) (SAM) through a web interface built with [React](https://react.dev/) and a [FastAPI](https://fastapi.tiangolo.com/) backend.

Follow these steps:

- 🆙 Upload any image.
- 🟢 Left click any part of the image to include it in your colouring.
- 🔴 Right click any part of the image to ignore it.
- 🎚️Change hue, saturation and lightness as you wish.

Some examples of what can be achieved in under 5 minutes per image are shown below

Original             |  Color Changed
:-------------------------:|:-------------------------:
| ![](figures/bolincheybochinche.jpg)  |  ![](figures/bolincheybochincheremake.png) |
| ![](figures/house.jpg) | ![](figures/houseremastered.png) |
| ![](figures/titanic.png) | ![](figures/titanic-redo.png)


__This project is an open-source work in progress. Feel free to raise any issues!__

## 🔧 Setup

This project requires `python >= 3.8` and `Node.js 18` to work properly. We recommend using **python 3.10** and **Node.js 18.16**. If you don't have python in your computer, you can install it from [here](https://www.python.org/downloads/release/python-3100/). Likewise, Node.js can be installed by following the instructions [here](https://nodejs.org/).

Clone this repo and open it

```bash
git clone https://github.com/alexbondino/imagine-houses.git
cd imagine-houses
```

Download the SAM files (including ONNX decoders) from this [google drive](https://drive.google.com/drive/folders/1JVL1oGfZWsSuO4RpmSOw2UKkNObsnVtn?usp=drive_link) and unzip them into`web-page/backend/app/assets`. Your assets folder should now look like this:

```python
── assets
   ├── sam_vit_b_01ec64.pth # base SAM model
   ├── sam_vit_l_0b3195.pth # large SAM model
   ├── sam_vit_h_4b8939.pth # huge SAM model
   ├── vit_b_quantized.onnx # base model ONNX mask decoder
   ├── vit_l_quantized.onnx # large model ONNX mask decoder
   └── vit_h_quantized.onnx # huge model ONNX mask decoder
```

## 🏗️ Building the App

__Step 1:__ Inside your repo, head to `web-page/frontend` and install JS packages using `npm` (packaged along with NodeJS):

```bash
cd web-page/frontend
npm install
```

__Step 2:__ Create a production build

```bash
npm run build
```
The previous commands should install and setup all necessary packages to run the project.

## 🖌️ Running the app

Now the fun starts! Run the app with the following command:

```bash
npm run serve
```

The previous command will simultaneously spin-up the FastAPI backend at port 8000 and launch the React web-app at port 3000. A new browser window should be automatically opened with the application, but you can also access it by heading to [localhost:3000](localhost:3000)

## License

This project is licensed under the [**MIT License**](LICENSE).