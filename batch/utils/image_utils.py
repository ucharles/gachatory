import os
import re
import cv2
import requests
import numpy as np
import json
from dotenv import load_dotenv
from concurrent.futures import ThreadPoolExecutor, as_completed


import logging

# 로깅 기본 설정: 로그 레벨, 로그 포맷 및 날짜 포맷 지정
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)


# from . import log

# dotenv
load_dotenv()

# database_url = os.getenv("DATABASE_URL")
# database_name = os.getenv("DATABASE_NAME")
image_download_folder = os.getenv("IMAGE_SERVER_PATH")


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


def brand_to_path(brand):
    switcher = {
        "Takara Tomy Arts": "images/takaratomy/",
        "BANDAI": "images/bandai/",
        "KITAN CLUB": "images/kitan/",
        "BUSHIROAD CREATIVE": "images/bushiroad/",
        "KOROKORO": "images/korokoro/",
        "tarlin (EPOCH)": "images/tarlin/",
    }

    # 디폴트 이미지 저장 경로 설정 (images 폴더)
    return switcher.get(brand, "images/unknown/")


# 이미지 다운로드 함수
def download_image(url, path):
    try:
        response = requests.get(url, verify=False)
        response.raise_for_status()  # 오류 시 예외 발생

        with open(path, "wb") as f:
            f.write(response.content)
        return path
    except Exception as e:
        logging.error(f"Error downloading {url}: {e}")
        return None


# 이미지 수집 함수
def get_capsule_toy_images(json_array_file):
    try:
        with open(json_array_file, "r", encoding="utf-8") as f:
            json_array = json.load(f)
    except Exception as e:
        print(f"File Error: {e}")
        return

    result = []

    # 이미지 URL과 저장 경로를 담을 리스트 생성
    download_tasks = []

    for item in json_array:
        detail_index = 2
        if "img" in item:
            img_filename = os.path.basename(item["img"])

            if item["brand"] == "KITAN CLUB":
                img_filename = os.path.basename(item["detail_url"][:-1]) + "_01.jpg"

            if item["brand"] == "BUSHIROAD CREATIVE":
                img_filename = re.sub("[^0-9a-zA-Z\._]", "", img_filename)

            if item["brand"] == "KOROKORO":
                img_filename = img_filename.replace("_1000px", "").replace(
                    "-800x800", ""
                )

            logging.debug(f"brand: {item['brand']}, img: {img_filename}")
            img_path = (
                image_download_folder + brand_to_path(item["brand"]) + img_filename
            )
            download_tasks.append((item["img"], img_path))
            item["img"] = brand_to_path(item["brand"]) + img_filename
        if "detail_img" in item:
            # Kitan Club의 경우 파일명이 중복되는 경우가 있어서 파일명을 변경
            new_detail_img = []
            for detail_img in item["detail_img"]:
                detail_img_filename = os.path.basename(detail_img)

                if item["brand"] == "KITAN CLUB":
                    # item['detail_url'] 파일명을 기준으로 파일명 변경
                    img_filename = os.path.basename(item["detail_url"][:-1])
                    detail_img_filename = (
                        img_filename + "_" + str(detail_index).zfill(2) + ".jpg"
                    )
                    detail_index += 1

                if item["brand"] == "BUSHIROAD CREATIVE":
                    detail_img_filename = re.sub(
                        "[^0-9a-zA-Z\._]", "", detail_img_filename
                    )

                if item["brand"] == "KOROKORO":
                    img_filename = img_filename.replace("_1000px", "").replace(
                        "-800x800", ""
                    )

                img_path = (
                    image_download_folder
                    + brand_to_path(item["brand"])
                    + detail_img_filename
                )
                download_tasks.append((detail_img, img_path))
                new_detail_img.append(
                    brand_to_path(item["brand"]) + detail_img_filename
                )
            item["detail_img"] = new_detail_img

    # 병렬 처리를 위한 ThreadPoolExecutor 사용
    # max_workers는 동시에 실행할 스레드 수, 최대 3개
    with ThreadPoolExecutor(max_workers=3) as executor:
        future_to_url = {
            # download_image 함수를 실행하고 결과를 future에 저장
            executor.submit(download_image, url, filename): url
            for url, filename in download_tasks
        }
        for future in as_completed(future_to_url):
            url = future_to_url[future]
            try:
                path = future.result()
                if path:
                    result.append(path)
                    logging.info(f"{url} downloaded to {path}")
            except Exception as exc:
                print(f"{url} generated an exception: {exc}")

    return json_array


if __name__ == "__main__":
    print(os.path.basename("https://kitan.jp/products/jujutsu_minisofbi/"[:-1]))
