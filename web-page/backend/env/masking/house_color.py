## Importing the dependencies.
import numpy as np
import matplotlib.pyplot as plt
import cv2
import os

current_dir = os.path.dirname(os.path.abspath(__file__))

## Defining the mask and the points
def show_mask(mask:list, ax, random_color=False):
    if random_color:
        color = np.concatenate([np.random.random(3), np.array([0.6])], axis=0)
    else:
        color = np.array([0/255, 255/255, 0/255, 0.6])
    h, w = mask.shape[-2:]
    mask_image = mask.reshape(h, w, 1) * color.reshape(1, 1, -1)
    ax.imshow(mask_image)
    
def show_points(coords:np.ndarray, labels:np.ndarray, ax, marker_size=200):
    pos_points = coords[labels==1]
    neg_points = coords[labels==0]
    ax.scatter(pos_points[:, 0], pos_points[:, 1], color='green', marker='.', s=marker_size, edgecolor='white', linewidth=1)
    ax.scatter(neg_points[:, 0], neg_points[:, 1], color='red', marker='.', s=marker_size, edgecolor='white', linewidth=1)  

## Model Fetching
def model_fetching():
    '''Uploads the model obtained from "https://github.com/facebookresearch/segment-anything" and generates the mask_generator
    and the sam used for the prediction in in model_aplication function.
    
    Note: sam_checkpoint needs to be downloaded in local due to it being too heavy for github to store. 
    Note2: Device can be changed to CUDA for better performance'''
    ## Uploading the model obtained from SAM github
    import sys
    sys.path.append("..")
    from segment_anything import sam_model_registry, SamAutomaticMaskGenerator

    sam_checkpoint = "masking/sam_vit_h_4b8939.pth"
    model_type = "vit_h"

    device = "cpu"

    sam = sam_model_registry[model_type](checkpoint=sam_checkpoint)
    sam.to(device=device)

    mask_generator = SamAutomaticMaskGenerator(sam)
    return mask_generator, sam
    
## Model Aplication
def model_aplication(image:np.ndarray, mask_generator, sam):
    '''Applies the model in Model Fetching and generates the predictor and
     the masks used for used in the image.
    
    Note: sam_checkpoint needs to be downloaded in local due to it being too heavy for github to store. 
    Note2: Device can be changed to CUDA for better performance'''
    from segment_anything import SamPredictor

    masks = mask_generator.generate(image)

    predictor = SamPredictor(sam)
    predictor.set_image(image)
    return predictor, masks


## Generating the final mask
def masking(input_point: np.ndarray, input_label: np.ndarray,  predictor):
    '''Uses the model over some given points to generate a chosen mask given the input data.'''
    ## Using the code with the input point and input label given
    masks, scores, logits = predictor.predict(
    point_coords=input_point,
    point_labels=input_label,
    multimask_output=True,
    )

    mask_input = logits[np.argmax(scores), :, :]  

    masks, _, _ = predictor.predict(
    point_coords=input_point,
    point_labels=input_label,
    mask_input=mask_input[None, :, :],
    multimask_output=False,
    )
    return masks


if __name__ == "__main__":
    
    image = cv2.imread(os.path.join(current_dir, "samples", "casa.jpeg", "assets"))
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    mask_generator_test, sam_test = model_fetching()
    predictor_test, masks_test = model_aplication(image, mask_generator_test, sam_test)

    input_point = np.array([[50,65],[50,100],[123,50]])
    input_label = np.array([1,0,1])

    masks_test = masking(input_point, input_label, predictor_test)

    plt.imshow(image)
    show_mask(masks_test, plt.gca())
    show_points(input_point, input_label, plt.gca())
    plt.axis('on')
    plt.show()