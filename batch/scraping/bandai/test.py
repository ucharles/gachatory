#!/usr/bin/env python3

import os, sys
from dotenv import load_dotenv

sys.path.append(
    os.path.dirname(
        os.path.abspath(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))
    )
)

from utils.image_utils import compare_images, save_img




load_dotenv()

absolute_path_bandai = os.getenv("IMAGE_SERVER_PATH")
print(absolute_path_bandai)


similarity_score = compare_images('bandai-prepare.jpg', 'bandai-prepare.jpg')
print(similarity_score)