import os
import re
import cv2
import requests
import numpy as np

from . import log


def save_img(img_url, location, img_name_init=""):
    img_name = img_url.split("/")[-1]
    img_name = re.sub("[^0-9a-zA-Z\._]", "", img_name)

    if img_name_init != "":
        img_name = img_name_init + "." + img_name.split(".")[-1]

    img_data = requests.get(img_url).content

    # 하위에 location 폴더 확인 후 없으면 폴더 생성
    if not os.path.isdir(location):
        os.makedirs(location)

    with open(location + "/" + img_name, "wb") as handler:
        handler.write(img_data)
    return img_name


def compare_images(image1, image2):
    try:
        img1 = cv2.imread(image1)
        img2 = cv2.imread(image2)

        # Convert images to grayscale for comparison
        img1 = cv2.resize(img1, (300, 300))
        img2 = cv2.resize(img2, (300, 300))

        # 이미지를 그레이스케일로 변환
        img1_gray = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
        img2_gray = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)

        # 히스토그램 계산
        hist1 = cv2.calcHist([img1_gray], [0], None, [256], [0, 256])
        hist2 = cv2.calcHist([img2_gray], [0], None, [256], [0, 256])

        # 히스토그램 비교
        similarity = cv2.compareHist(hist1, hist2, cv2.HISTCMP_CORREL)

        return similarity
    except:
        log("error", 0, "", 0, "img error" + image1 + ", " + image2)
        mse_value = 0
        similarity = 0
    finally:
        return similarity
