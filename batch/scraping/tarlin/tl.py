import requests
from bs4 import BeautifulSoup
import certifi
import re
import json
import os
import sys
from dotenv import load_dotenv
from datetime import datetime
import time
import unicodedata
from concurrent.futures import ThreadPoolExecutor, as_completed


from mongoengine import (
    connect,
    DynamicDocument,
    StringField,
    IntField,
    ListField,
    DateTimeField,
)
from mongoengine.queryset.visitor import Q

import logging

# 로깅 기본 설정: 로그 레벨, 로그 포맷 및 날짜 포맷 지정
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

sys.path.append(
    os.path.dirname(
        os.path.abspath(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))
    )
)

from utils.write_file import write_file
from utils.date_convert_to_ISO import format_month
from utils.num_formatter import extract_price_from_string
from scraping.capsule_toy_classes import CapsuleToyCl, TarlinCapsuleToyCl
from utils.image_utils import get_capsule_toy_images
from utils.crud_mongodb import filter_exist_db, insert_new_product_as_bulk


# models
from models.capsule_toy import CapsuleToy, CapsuleTag


DOMAIN = "https://tarlin-capsule.jp"
# TAKARATOMY_OLD_URL = "https://www.takaratomy-arts.co.jp/items/gacha/search.html"
# TAKARATOMY_OLD_PAGE_PARAM = "p"
NEW_URL = "https://tarlin-capsule.jp/api/products?_start="
# BUSHIROAD_NEW_PAGE_PARAM = "page"

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__)).replace("\\", "/")
print_date_format = datetime.today().strftime("%Y%m%d")


# dotenv
load_dotenv()

database_url = os.getenv("DATABASE_URL")
database_name = os.getenv("DATABASE_NAME")
image_download_folder = os.getenv("IMAGE_SERVER_PATH")


def get_new_items():
    url = NEW_URL

    result = []

    start = 0

    while True:
        if start >= 400:
            break
        try:
            res = requests.get(url + str(start), verify=False)
            # JSON 파싱
            data = res.json()
        except Exception as e:
            logging.error(f"Network Error: {e}")
            continue

        for item in data:
            try:
                capsule_toy = TarlinCapsuleToyCl(
                    name=item["name"],
                    detail_url=f"{DOMAIN}/product/{item['id']}",
                    img=f"{DOMAIN}{item['mainimage']['url']}",
                )

                result.append(capsule_toy.get_json())

            except Exception as e:
                logging.error(f"Parsing Error: {e}")

            write_file(result, CURRENT_DIR + "/1-daily/")

        start += 100
        time.sleep(1)

    return result


def get_detail_info(file):
    try:
        with open(file, "r", encoding="utf-8") as f:
            json_array = json.load(f)
    except Exception as e:
        logging.error(f"File Error: {e}")
        return

    result = []

    for item in json_array:
        try:
            res = requests.get(item["detail_url"], verify=False)
            soup = BeautifulSoup(res.text, "html.parser")
        except Exception as e:
            logging.error(f"Network Error: {e}")
            continue

        try:
            container = soup.find("div", class_="product-info")
            description = (
                element.text
                if (element := container.find("p", class_="product-desc")) is not None
                else ""
            )

            match = re.search(r"\d{4}年\d{1,2}月", description)
            date = match.group() if match else item["date"]

            tags = container.find_all("a", class_="product-tag")

            tag_list = []
            for tag in tags:
                tag_list.append(tag.text)

            dts = container.find_all("dt", class_="product-data-label")
            dds = container.find_all("dd", class_="product-data-val")

            for idx, dt in enumerate(dts):
                if "価格" in dt.text:
                    price = dds[idx].text

            img_container = soup.find("div", class_="swiper-wrapper")
            imgs = img_container.find_all("img")

            detail_img = []
            img_filename = os.path.basename(item["img"])
            for img in imgs:
                file_name = os.path.basename(img.get("src"))
                file_name = "_".join(file_name.split("_")[1:])
                if file_name != img_filename:
                    detail_img.append(f"{DOMAIN}/uploads/{file_name}")

            # detail_img 정렬
            # 파일 이름에 있는 _xxx_ 부분을 숫자로 변환하여 정렬

            detail_img.sort(
                key=lambda x: (
                    int(re.search(r"_(\d+)_", x).group(1))
                    if re.search(r"_(\d+)_", x)
                    else 0
                )
            )

        except Exception as e:
            logging.error(f"URL: {item['detail_url']} Parsing Error: {e}")
            # 자세한 에러 로그
            continue

        try:
            capsule_toy = TarlinCapsuleToyCl(
                name=item["name"],
                date=date,
                price=price,
                description=re.sub(r"\d{4}年\d{1,2}月発売(予定)?", "", description)
                + " "
                + " ".join(tag_list),
                img=item["img"],
                detail_url=item["detail_url"],
                detail_img=detail_img,
            )

            result.append(capsule_toy.get_json())
            write_file(result, CURRENT_DIR + "/3-detail/")
            logging.info(f"Success: {item['name']}")
        except Exception as e:
            logging.error(f"Class Error: {e}")
            continue

        time.sleep(1)

    return result


if __name__ == "__main__":
    # 신상 데이터 수집
    daily_result = get_new_items()
    write_file(daily_result, CURRENT_DIR + "/1-daily/")

    # DB 내용과 대조, 필터링
    filtered_result = filter_exist_db(
        CURRENT_DIR + f"/1-daily/{print_date_format}.json", "tarlin"
    )
    write_file(filtered_result, CURRENT_DIR + "/2-filtered/")

    # 상세 페이지 정보 수집
    detail_result = get_detail_info(
        CURRENT_DIR + f"/2-filtered/{print_date_format}.json"
    )
    write_file(detail_result, CURRENT_DIR + "/3-detail/")

    # 이미지 수집
    image_result = get_capsule_toy_images(
        CURRENT_DIR + f"/3-detail/{print_date_format}.json"
    )
    write_file(image_result, CURRENT_DIR + f"/4-image-collect/")

    # DB 갱신
    insert_new_product_as_bulk(
        CURRENT_DIR + f"/4-image-collect/{print_date_format}.json"
    )
