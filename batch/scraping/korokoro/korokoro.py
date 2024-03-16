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
from utils.date_convert_to_ISO import format_month
from utils.num_formatter import extract_price_from_string
from scraping.capsule_toy_classes import CapsuleToyCl, KorokoroCapsuleToyCl
from utils.image_utils import get_capsule_toy_images
from utils.crud_mongodb import filter_exist_db, insert_new_product_as_bulk


# models
from models.capsule_toy import CapsuleToy, CapsuleTag


# BUSHIROAD_DOMAIN = "https://bushiroad-creative.com/"
# TAKARATOMY_OLD_URL = "https://www.takaratomy-arts.co.jp/items/gacha/search.html"
# TAKARATOMY_OLD_PAGE_PARAM = "p"
NEW_URL = "https://www.ip4.co.jp/cupsuletoy_top/page/"
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

    page = 1
    result = []

    while True:
        if page == 6:
            break
        logging.info(f"Page: {page}")

        try:
            res = requests.get(url + str(page))
            soup = BeautifulSoup(res.text, "html.parser")
        except Exception as e:
            logging.error(f"Network Error: {e}")
            break

        try:
            container = soup.find("div", id="cupsuletoy")
            items = container.find_all("li")
        except Exception as e:
            logging.error(f"No found container Error: {e}")
            break

        if not container:
            break

        for item in items:
            try:
                detail_url = (
                    element.get("href")
                    if (element := item.find("a")) is not None
                    else ""
                )
                img = (
                    element.get("src")
                    if (element := item.find("img")) is not None
                    else ""
                )

                info_container = item.find("dl")
                date = (
                    element.text
                    if (element := info_container.find("dt")) is not None
                    else ""
                )
                brand = (
                    element.text.strip()
                    if (element := info_container.find("div", class_="brand"))
                    is not None
                    else ""
                )
                copy = (
                    element.text.strip()
                    if (element := info_container.find("div", class_="copy"))
                    is not None
                    else ""
                )
                title = (
                    element.text.replace(copy.strip(), "").replace(brand, "").strip()
                    if (element := info_container.find("dd")) is not None
                    else ""
                )

                capsule_toy = KorokoroCapsuleToyCl(
                    name=f"{brand} {title}",
                    detail_url=detail_url,
                    img=img,
                    date=date,
                )

                result.append(capsule_toy.get_json())

            except Exception as e:
                logging.error(f"Parsing Error: {e}")
                continue

        page += 1

        write_file(result, CURRENT_DIR + "/1-daily/")

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
            res = requests.get(item["detail_url"])
            soup = BeautifulSoup(res.text, "html.parser")
        except Exception as e:
            logging.error(f"Network Error: {e}")
            continue

        try:
            container = soup.find("div", class_="data-read")

            if not container:
                Exception("No found container")

            p = container.find_all("p")

            if not p:
                Exception("No found p")

            description = element.text if (element := p[0]) is not None else ""
            price = element.text if (element := p[1]) is not None else ""
            copyright = element.text if (element := p[2]) is not None else ""

            img_container = soup.find("ul", id="navi")
            li = img_container.find_all("li")

            detail_img = [
                element.get("href") if (element := item.find("a")) is not None else None
                for item in li
            ][1:]

            # 빈 내용 제거
            detail_img = list(filter(None, detail_img))

        except Exception as e:
            logging.error(f"URL: {item['detail_url']} Parsing Error: {e}")
            # 자세한 에러 로그
            continue

        try:
            capsule_toy = KorokoroCapsuleToyCl(
                name=item["name"],
                date=item["date"],
                price=price,
                description=f"{description} {copyright}",
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
        CURRENT_DIR + f"/1-daily/{print_date_format}.json", "korokoro"
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
