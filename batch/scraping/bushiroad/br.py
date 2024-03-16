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
from scraping.capsule_toy_classes import CapsuleToyCl, BushiroadCapsuleToyCl
from utils.image_utils import get_capsule_toy_images
from utils.crud_mongodb import filter_exist_db, insert_new_product_as_bulk


# models
from models.capsule_toy import CapsuleToy, CapsuleTag


BUSHIROAD_DOMAIN = "https://bushiroad-creative.com/"
# TAKARATOMY_OLD_URL = "https://www.takaratomy-arts.co.jp/items/gacha/search.html"
# TAKARATOMY_OLD_PAGE_PARAM = "p"
BUSHIROAD_NEW_URL = "https://bushiroad-creative.com/products?lcategory%5B0%5D=2"
BUSHIROAD_NEW_PAGE_PARAM = "page"

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__)).replace("\\", "/")
print_date_format = datetime.today().strftime("%Y%m%d")


# dotenv
load_dotenv()

database_url = os.getenv("DATABASE_URL")
database_name = os.getenv("DATABASE_NAME")
image_download_folder = os.getenv("IMAGE_SERVER_PATH")


def get_new_items():
    url = BUSHIROAD_NEW_URL

    page = 1
    result = []

    while True:
        logging.info(f"Page: {page}")
        if page == 11:
            break

        try:
            res = requests.get(url, params={BUSHIROAD_NEW_PAGE_PARAM: page})
            soup = BeautifulSoup(res.text, "html.parser")
        except Exception as e:
            logging.error(f"Network Error: {e}")
            break

        try:
            container = soup.find(
                "div", class_="p-block-c-b c-grid-responsive-b c-grid-responsive"
            )
            items = container.find_all("a")
        except Exception as e:
            logging.error(f"Error: {e}")
            break

        if not container:
            break

        for item in items:
            try:
                detail_url = item.get("href")
                img = item.find("img").get("src")
                title = item.find("p", class_="p-block-c-a__title c-text").text

                capsule_toy = BushiroadCapsuleToyCl(
                    name=title,
                    detail_url=detail_url,
                    img=img,
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

    if json_array is None:
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
            description = (
                element.text
                if (element := soup.find("article", class_="c-post blog-container"))
                is not None
                else ""
            )

            detail_container = soup.find("div", class_="p-block-c-e__items c-box")

            if detail_container is None:
                logging.error(f"Detail Container Error: {item['detail_url']}")
                continue

            detail_titles = detail_container.find_all(
                "div", class_="p-block-c-e__item__title"
            )
            detail_txts = detail_container.find_all(
                "div", class_="p-block-c-e__item__text"
            )

            date, price, spec, size = "", "", "", ""

            # detail_titles를 인덱스로 순회하면서 detail_txts의 내용을 가져옴
            for idx, title in enumerate(detail_titles):
                if "発売日" in title.text:
                    date = detail_txts[idx].text
                elif "価格" in title.text:
                    price = detail_txts[idx].text
                elif "仕様" in title.text:
                    spec = detail_txts[idx].text
                elif "サイズ" in title.text:
                    size = f"【サイズ】{detail_txts[idx].text}"

            copyright = (
                element.text
                if (element := soup.find("p", class_="p-block-c-e__text c-text"))
                is not None
                else ""
            )

            detail_imgs = soup.find(
                "div", class_="p-block-c-d__thumb c-box js-img-switch__thumb"
            )

            detail_img = None

            if detail_imgs is not None:
                detail_img = [img.get("src") for img in detail_imgs.find_all("img")][1:]

        except Exception as e:
            logging.error(f"URL: {item['detail_url']} Parsing Error: {e}")
            # 자세한 에러 로그
            continue

        try:
            capsule_toy = BushiroadCapsuleToyCl(
                name=item["name"],
                date=date,
                price=price,
                description=f"{description} {spec} {size} {copyright}",
                img=item["img"],
                detail_url=item["detail_url"],
                detail_img=detail_img,
            )

            # date 정보가 없는 경우
            if capsule_toy.get_json()["date"] == None:
                logging.error(f"Date Error: {item['name']}")
                continue

            result.append(capsule_toy.get_json())
            write_file(result, CURRENT_DIR + "/3-detail/")
            logging.info(f"Success: {item['name']}")
        except Exception as e:
            logging.error(f"Class Error: {e}")
            continue

        time.sleep(1)

    return result


if __name__ == "__main__":
    # # 이전 데이터 수집
    # result = get_takaratomy_old_items()
    # write_file(result, CURRENT_DIR + "/old_items_final")

    # 신상 데이터 수집
    daily_result = get_new_items()
    write_file(daily_result, CURRENT_DIR + "/1-daily/")

    # DB 내용과 대조, 필터링
    filtered_result = filter_exist_db(
        CURRENT_DIR + f"/1-daily/{print_date_format}.json", "BUSHIROAD CREATIVE"
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
