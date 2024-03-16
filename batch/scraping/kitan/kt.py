import requests
from bs4 import BeautifulSoup
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
from utils.date_convert_to_ISO import format_month, date_convert_to_iso
from utils.num_formatter import extract_price_from_string
from utils.crud_mongodb import filter_exist_db
from scraping.capsule_toy_classes import CapsuleToyCl, KitanClubCapsuleToyCl
from utils.image_utils import get_capsule_toy_images
from utils.crud_mongodb import insert_new_product_as_bulk


# models
from models.capsule_toy import CapsuleToy, CapsuleTag


KITANCLUB_DOMAIN = "https://kitan.jp"
# TAKARATOMY_OLD_URL = "https://www.takaratomy-arts.co.jp/items/gacha/search.html"
# TAKARATOMY_OLD_PAGE_PARAM = "p"
KITANCLUB_NEW_URL = "https://kitan.jp/product_category/newproduct/"
# TAKARATOMY_NEW_PAGE_PARAM = "page"

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__)).replace("\\", "/")
print_date_format = datetime.today().strftime("%Y%m%d")


# dotenv
load_dotenv()

database_url = os.getenv("DATABASE_URL")
database_name = os.getenv("DATABASE_NAME")
image_download_folder = os.getenv("IMAGE_SERVER_PATH")


def get_kitan_club_new_items():
    url = KITANCLUB_NEW_URL

    result = []

    try:
        res = requests.get(url)
        soup = BeautifulSoup(res.text, "html.parser")
    except Exception as e:
        logging.error(f"Request Error: {e}")
        return

    try:
        container = soup.find("div", class_="c-productBox__area")
        items = container.find_all("li", class_="c-productBox__item")
    except Exception as e:
        logging.error(f"Container Error: {e}")
        return

    if not container:
        return

    for item in items:
        try:
            detail_url = item.find("a").get("href")
            img = item.find("figure").find("img").get("src")

            capsule_toy = KitanClubCapsuleToyCl(
                detail_url=detail_url,
                img=img,
            )

            result.append(capsule_toy.get_json())
            logging.info(f"Item: {detail_url}")

        except Exception as e:
            logging.error(f"Item Error: {e}")
            continue

    write_file(result, CURRENT_DIR + "/1-daily/")

    return result


def get_detail_info_kitan_club(file):

    result = []

    # 파일 읽기
    try:
        with open(file, "r", encoding="utf-8") as f:
            json_array = json.load(f)
    except Exception as e:
        logging.error(f"File Error: {e}")
        return

    # 상세 페이지 정보 수집
    for item in json_array:
        detail_imgs = []

        if not item["detail_url"]:
            logging.error("No Detail URL")
            continue

        try:
            res = requests.get(item["detail_url"])
            soup = BeautifulSoup(res.text, "html.parser")
        except Exception as e:
            logging.error(f"Request Error: {e}")
            continue

        try:
            detail_container = soup.find("div", class_="c-productDetail__desc")
            name = detail_container.find("h2").text
            description = detail_container.find(
                "div", class_="c-productDetail__text"
            ).text

            detail_info = detail_container.find_all(
                "dl", class_="c-productDetail__detail-item"
            )
            # 3번째 dd에 발매일
            # 5번째 dd에 가격
            # 6번째 dd에 copyright
            date = detail_info[2].find("dd").text
            price = detail_info[4].find("dd").text
            copyright = detail_info[5].find("dd").text

        except Exception as e:
            logging.error(f"Container Error: {e}")
            continue

        try:
            image_container = soup.find("ul", class_="c-productDetail__pickup-list")

            for img in image_container.find_all("img"):
                detail_imgs.append(img.get("src"))

        except Exception as e:
            logging.error(f"Image Container Error: {e}")
            continue

        capsule_toy = KitanClubCapsuleToyCl(
            name=name,
            date=date,
            price=price,
            img=item["img"],
            detail_url=item["detail_url"],
            description=description + copyright,
            detail_img=detail_imgs,
        )

        result.append(capsule_toy.get_json())
        logging.info(f"Item: {name}")
        write_file(result, CURRENT_DIR + "/3-detail/")

        time.sleep(1)

    return result


if __name__ == "__main__":
    # 신상 데이터 수집
    daily_result = get_kitan_club_new_items()
    write_file(daily_result, CURRENT_DIR + "/1-daily/")

    # DB 내용과 대조, 필터링
    filtered_result = filter_exist_db(
        CURRENT_DIR + f"/1-daily/{print_date_format}.json", "KITAN CLUB"
    )
    write_file(filtered_result, CURRENT_DIR + "/2-filtered/")

    # 상세 페이지 정보 수집
    detail_result = get_detail_info_kitan_club(
        CURRENT_DIR + f"/2-filtered/{print_date_format}.json"
    )
    write_file(detail_result, CURRENT_DIR + "/3-detail/")

    # 이미지 수집
    result = get_capsule_toy_images(CURRENT_DIR + f"/3-detail/{print_date_format}.json")
    write_file(result, CURRENT_DIR + f"/4-image-collect/")

    # DB 갱신
    insert_new_product_as_bulk(
        CURRENT_DIR + f"/4-image-collect/{print_date_format}.json"
    )
