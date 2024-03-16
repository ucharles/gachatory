# 캡슐 토이 클래스는 어떻게 만들지...
# 캡슐화, 확장, 재활용...

# 사이트 형태는 다 다르게 생겼다
# 수집해야 하는 정보는 항상 같다
# url을 가지고, 캡슐 토이 이름, 설명, 이미지, 발매년월, 가격, 상세페이지 URL
# 수집하는 방법은 다 다르다
# 수집하는 방법을 클래스로 만들어서 사용하면 될듯

# batch 폴더를 상위 폴더로 지정하고, sys.path.append로 추가
# os.path.abspath(os.path.dirname()) 하나 당 상위 폴더로 이동

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

sys.path.append(
    os.path.dirname(
        os.path.abspath(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))
    )
)

from utils.write_file import write_file
from utils.date_convert_to_ISO import format_month
from utils.num_formatter import extract_price_from_string
from scraping.capsule_toy_classes import TakaraTomyCapsuleToyCl
from utils.image_utils import get_capsule_toy_images
from utils.crud_mongodb import insert_new_product_as_bulk

# models
from models.capsule_toy import CapsuleToy, CapsuleTag


TAKARATOMY_DOMAIN = "https://www.takaratomy-arts.co.jp"
TAKARATOMY_OLD_URL = "https://www.takaratomy-arts.co.jp/items/gacha/search.html"
TAKARATOMY_OLD_PAGE_PARAM = "p"
TAKARATOMY_NEW_URL = "https://www.takaratomy-arts.co.jp/items/gacha/"
TAKARATOMY_NEW_PAGE_PARAM = "page"

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__)).replace("\\", "/")
print_date_format = datetime.today().strftime("%Y%m%d")

# dotenv
load_dotenv()

database_url = os.getenv("DATABASE_URL")
database_name = os.getenv("DATABASE_NAME")
image_download_folder = os.getenv("IMAGE_SERVER_PATH")


import logging

# 로깅 기본 설정: 로그 레벨, 로그 포맷 및 날짜 포맷 지정
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)


# 타카라토미에서 신상 수집
# DB 내용과 조회해야 함
# brand가 'Takara Tomy Arts" 인 캡슐 토이에서 중복 조회
# 초반에 위 내용을 set로 추출하면 될듯

# 먼저 신상이 아닌 것을 조회해야 함. 한 페이지에 40개
# https://www.takaratomy-arts.co.jp/items/gacha/search.html?p=1

# 신상은 아래 페이지에서 조회. 한 페이지에 20개
# https://www.takaratomy-arts.co.jp/items/gacha/?page=1


# 신상이 아닌 것

# 1. 페이지를 조회한다
# 2. DB에서 기존 데이터를 SET로 저장 (함수 전역)
# 3. 정보 추출하여 JSON에 저장
# 4. 추출하는 정보는 상세페이지 링크, 상세 이미지 링크, 이름, 가격, 발매년월
# 5. 이 시점에 이미지는 저장하지 않음

# div#dbitems > a > img, h3, p, p


def get_takaratomy_old_items():
    url = TAKARATOMY_OLD_URL

    page = 1
    result = []

    while True:
        print(f"Page: {page}")
        if page == 10:
            break

        try:
            res = requests.get(url, params={TAKARATOMY_OLD_PAGE_PARAM: page})
            soup = BeautifulSoup(res.text, "html.parser")
        except Exception as e:
            print("Connection Error to Takaratomy")
            print(f"Error: {e}")
            break

        try:
            container = soup.find("div", class_="dbitems")
            items = container.find_all("a")
        except Exception as e:
            print("Parsing Error, No Container or Items Found")
            print(f"Error: {e}")
            break

        if not container:
            break

        for item in items:
            try:
                detail_url = item.get("href")
                img = item.find("img").get("src")
                title = item.find("h3").text
                p = item.find_all("p")

                for i in p:
                    if "発売" in i.text:
                        release = i.text
                    elif "価格" in i.text:
                        price = i.text

                takara_tomy = TakaraTomyCapsuleToyCl(
                    name=title,
                    date=release,
                    price=price,
                    detail_url=detail_url,
                    detail_img=img,
                )

                result.append(takara_tomy.get_json())

            except Exception as e:
                print(f"Error: {e}")
                print("Error:", item)
                continue

        page += 1

        write_file(result, CURRENT_DIR + "/takaratomy_old_items")

        time.sleep(1)

    return result


def get_takaratomy_new_items():
    url = TAKARATOMY_NEW_URL
    result = []

    try:
        with open(
            CURRENT_DIR + f"/0-html/{print_date_format}.html", "r", encoding="utf-8"
        ) as f:
            html_text = f.read()
    except Exception as e:
        logging.error(f"File Error: {e}")
        return

    try:
        soup = BeautifulSoup(html_text, "html.parser")
    except Exception as e:
        logging.error(f"HTML Parsing Error: {e}")
        return

    try:
        container = soup.find("div", class_="dbitems")
        items = container.find_all("a")
    except Exception as e:
        logging.error(f"Container or Items Parsing Error: {e}")
        return

    for item in items:
        try:
            detail_url = item.get("href")
            img = item.find("img").get("src")
            title = item.find("h3").text

            takara_tomy = TakaraTomyCapsuleToyCl(
                name=title,
                detail_url=detail_url,
                detail_img=img,
            )

            result.append(takara_tomy.get_json())

        except Exception as e:
            logging.error(f"Error: {e}")
            logging.error(f"Error Item: {item}")
            continue

        write_file(result, CURRENT_DIR + "/1-daily/")

    return result


# JSON Object Array를 받아서 DB와 내용 대조
# DB의 내용은 추출하여 Set로 저장
# mongoengine를 사용하여 DB 조회
# DB에 없는 것만 추출하여 JSON으로 반환


# 공통함수로 빼기
def filter_exist_takaratomy_db(json_array_file, brand=""):
    # read file
    try:
        with open(json_array_file, "r", encoding="utf-8") as f:
            json_array = json.load(f)
    except Exception as e:
        logging.error(f"File Error: {e}")
        return

    # connect to db
    try:
        connect(database_name, host=database_url)
        logging.info("DB Connection Success")
    except Exception as e:
        logging.error(f"DB Connection Error: {e}")
        return

    # get all items
    try:
        items = CapsuleToy.objects(Q(brand="Takara Tomy Arts"))
    except Exception as e:
        logging.error(f"DB Query Error: {e}")
        return

    # set
    db_set = set()
    for item in items:
        db_set.add(item.detail_url)

    # filter
    result = []
    for item in json_array:
        if item["detail_url"] not in db_set:
            result.append(item)
            logging.info(f"New Item Found: {item['name']}")

    return result


def test():
    url = TAKARATOMY_NEW_URL

    res = requests.get(url, params={TAKARATOMY_NEW_PAGE_PARAM: 10})
    soup = BeautifulSoup(res.text, "html.parser")

    with open("takaratomy_new_test.html", "w", encoding="utf-8") as f:
        f.write(soup.prettify())

    # container = soup.find("div", class_="dbitems")
    # items = container.find_all("a")
    # print(container)

    pass


def get_detail_info_takaratomy(json_array_file):
    # read file
    try:
        with open(json_array_file, "r", encoding="utf-8") as f:
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
            logging.error(f"Connection Error to {item['detail_url']}")
            continue

        try:
            container = soup.find("section", id="detail")

            # header
            header = container.find("h3").text
            img = container.find("img").get("src")
            description = container.find("div", class_="summary").text
            bottoms = container.find("div", class_="bottoms")
            copyright = bottoms.find("small").text

            # head에서 발매일과 가격을 추출
            head = container.find("div", class_="head")
            date_and_price = head.find("p").text

            # 전각 공백으로 문자열을 분리하여 각각 price, date로 저장
            price, date = date_and_price.replace("■", "").split("\u3000")

            takaratomy = TakaraTomyCapsuleToyCl(
                name=item["name"],
                date=date,
                price=price,
                img=img,
                detail_img=item["detail_img"],
                detail_url=item["detail_url"],
                header=header,
                description=description + "\r\n" + copyright,
            )
            result.append(takaratomy.get_json())
            logging.info(f"New Item Inserted: {item['name']}")
        except Exception as e:
            logging.error(f"Error: {e}")
            continue

        write_file(result, CURRENT_DIR + "/3-detail/")
        logging.info(f"File Written: {CURRENT_DIR}/3-detail/")

        time.sleep(1)

    return result
    pass


import tt_selenium

if __name__ == "__main__":
    # # 이전 데이터 수집
    # result = get_takaratomy_old_items()
    # write_file(result, CURRENT_DIR + "/takaratomy_old_items_final")

    tt_selenium

    # 신상 데이터 수집
    daily_result = get_takaratomy_new_items()
    write_file(daily_result, CURRENT_DIR + "/1-daily/")

    # DB 내용과 대조, 필터링
    filtered_result = filter_exist_takaratomy_db(
        CURRENT_DIR + f"/1-daily/{print_date_format}.json"
    )
    write_file(filtered_result, CURRENT_DIR + "/2-filtered/")

    # 상세 페이지 정보 수집
    detail_result = get_detail_info_takaratomy(
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

    pass
