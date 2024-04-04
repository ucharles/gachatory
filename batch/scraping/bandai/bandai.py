import requests
from bs4 import BeautifulSoup
import certifi
import re
import json
import os
import sys
from dotenv import load_dotenv
from datetime import datetime, timezone, timedelta
from dateutil.relativedelta import relativedelta
from bson import ObjectId

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
from scraping.capsule_toy_classes import CapsuleToyCl, BandaiCapsuleToyCl
from utils.image_utils import get_capsule_toy_images, compare_images
from utils.crud_mongodb import filter_exist_db, insert_new_product_as_bulk


# models
from models.capsule_toy import CapsuleToy, CapsuleTag


DOMAIN = "https://tarlin-capsule.jp"
# TAKARATOMY_OLD_URL = "https://www.takaratomy-arts.co.jp/items/gacha/search.html"
# TAKARATOMY_OLD_PAGE_PARAM = "p"
NEW_URL = "https://gashapon.jp/schedule/?ym="
# BUSHIROAD_NEW_PAGE_PARAM = "page"

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__)).replace("\\", "/")
print_date_format = datetime.today().strftime("%Y%m%d")


# dotenv
load_dotenv()

database_url = os.getenv("DATABASE_URL")
database_name = os.getenv("DATABASE_NAME")
image_download_folder = os.getenv("IMAGE_SERVER_PATH")
absolute_path_bandai = os.getenv("ABSOLUTE_PATH_BANDAI")

bandai_prepare_img = absolute_path_bandai + "bandai-prepare.jpg"


def connect_to_db():
    try:
        connect(database_name, host=database_url)
        logging.info("DB Connection Success")
    except Exception as e:
        logging.error(f"DB Connection Error: {e}")
        raise


def get_new_items():
    url = NEW_URL

    result = []

    today = datetime.now(timezone(timedelta(hours=9)))

    start_date = today.strftime("%Y%m")
    end = today.replace(year=today.year + 1)
    end_date = end.strftime("%Y%m")

    while True:
        if start_date == end_date:
            break

        logging.info(f"Start Date: {start_date}")
        try:
            res = requests.get(url + str(start_date))
            soup = BeautifulSoup(res.text, "html.parser")

        except Exception as e:
            logging.error(f"Network Error: {e}")
            continue

        try:
            container = soup.find("div", class_="pg-data__schedule")
            if container is None:
                logging.info(start_date + " No Data")
                start_date = datetime.strptime(start_date, "%Y%m") + relativedelta(
                    months=1
                )
                start_date = start_date.strftime("%Y%m")
                continue
            weeks = container.find_all("div", class_="week")
        except Exception as e:
            logging.error(f"Container Error: {e}")
            continue

        for week in weeks:
            if week.find("span", class_="pg-schedule__month--date"):
                day = week.find("span", class_="pg-schedule__month--date").text
                day = day.split(".")[1].zfill(2) + "日"
            else:
                day = "未定"

            date = f"{start_date[:4]}年{start_date[5:7]}月{day}"

            items = week.find_all("a", class_="c-card__link")

            for item in items:
                detail_url = item.get("href")
                name = (
                    element.text
                    if (element := item.find("p", class_="c-card__name")) is not None
                    else ""
                )
                price = (
                    element.text
                    if (element := item.find("p", class_="c-card__price")) is not None
                    else ""
                )

                image = (
                    element.get("src")
                    if (element := item.find("img")) is not None
                    else ""
                )

                resale = (
                    True
                    if (element := item.find("div", class_="c-card__resale"))
                    else False
                )
                try:
                    capsule_toy = BandaiCapsuleToyCl(
                        name=name,
                        date=date,
                        detail_url=detail_url,
                        img=image,
                        price=price,
                        resale=resale,
                    )

                    result.append(capsule_toy.get_json())

                except Exception as e:
                    logging.error(f"Parsing Error: {e}")

                write_file(result, CURRENT_DIR + "/1-daily/")

        # date update
        start_date = datetime.strptime(start_date, "%Y%m") + relativedelta(months=1)
        start_date = start_date.strftime("%Y%m")

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
            container = soup.find("div", class_="pg-productInfo")
            description = (
                element.text
                if (element := container.find("div", class_="pg-productInfo__desc"))
                is not None
                else ""
            )

            img_container = soup.find("div", class_="pg-productInfo__thumbnails")
            imgs = img_container.find_all("img")

            detail_img = []
            img_filename = os.path.basename(item["img"])
            image = item["img"]
            for img in imgs:
                file_name = os.path.basename(img.get("src"))
                if file_name[-6:] == "_1.jpg":
                    image = img.get("src")
                else:
                    detail_img.append(img.get("src"))

        except Exception as e:
            logging.error(f"URL: {item['detail_url']} Parsing Error: {e}")
            # 자세한 에러 로그
            continue

        try:
            capsule_toy = BandaiCapsuleToyCl(
                _id=item.get("_id") if item.get("_id") else "",
                name=item["name"],
                date=item["date"],
                price=item["price"],
                description=description,
                img=image,
                detail_url=item["detail_url"],
                detail_img=detail_img,
            )

            result.append(capsule_toy.get_json())
            logging.info(f"Success: {item['name']}")
        except Exception as e:
            logging.error(f"Class Error: {e}")
            continue

        time.sleep(1)

    return result


def insert_resale_product(file):
    # JSON 파일 읽기
    try:
        with open(file, "r", encoding="utf-8") as f:
            json_array = json.load(f)
    except Exception as e:
        logging.error(f"File Error: {e}")
        return

    # resale 상품만 필터링
    json_array = [
        item
        for item in json_array
        if item["resale"] == True and "【箱売】" not in item["name"]
    ]

    # DB 연결
    connect_to_db()

    # detail_url로 DB 조회

    try:
        for item in json_array:
            capsule = CapsuleToy.objects(Q(detail_url=item["detail_url"])).first()
            if capsule is None:
                logging.info(f"Resale Fail: {item['name']}")
                continue

            if item["date"] in capsule.date:
                logging.info(f"The date matches exactly: {item['name']}")
                continue

            logging.info(f"Date partial match check: {item['date'][:8]}")

            if item["date"][:8] in capsule.date:
                logging.info(f"The date partially matches: {item['name']}")
                capsule.date[0] = item["date"]
                capsule.dateISO[-1] = item["dateISO"]
            elif item["date"] not in capsule.date:
                logging.info(f"The date is a complete mismatch: {item['name']}")
                capsule.date = [item["date"]] + capsule.date
                capsule.dateISO.append(item["dateISO"])

            capsule.updatedAt = datetime.now(timezone.utc)
            capsule.releaseUpdateDate = datetime.now(timezone.utc)
            print(capsule.to_mongo().to_dict())
            logging.info(f"Resale Success: {item['name']}")
            capsule.save()

    except Exception as e:
        logging.error(f"DB Error: {e}")

    return json_array


def filter_prepare_image(file):
    # JSON 파일 읽기
    try:
        with open(file, "r", encoding="utf-8") as f:
            json_array = json.load(f)
    except Exception as e:
        logging.error(f"File Error: {e}")
        return

    # img, detail_img를 순회하며 bandai-prepare.jpg와 비교
    for item in json_array:
        if "img" in item:
            stored_image = image_download_folder + item["img"]
            # 준비중 이미지와 유사도 비교
            similarity_score = compare_images(bandai_prepare_img, stored_image)
            # 숫자가 작을 수록 유사도 낮음
            if similarity_score > 0.9:
                os.remove(stored_image)
                item["img"] = ""

        if "detail_img" in item:
            for i, detail_img in enumerate(item["detail_img"]):
                stored_image = image_download_folder + detail_img
                # 준비중 이미지와 유사도 비교
                similarity_score = compare_images(bandai_prepare_img, stored_image)
                # 숫자가 작을 수록 유사도 낮음
                if similarity_score > 0.9:
                    os.remove(stored_image)
                    item["detail_img"].pop(i)

    return json_array


def get_no_image_capsule():
    # DB 연결
    connect_to_db()

    # 이번달에 출시된 상품 중 이미지가 없는 상품 조회
    today_datetime = datetime.now(timezone(timedelta(hours=9)))
    today = today_datetime.strftime("%Y年%m月")

    # DB 조회
    capsules = CapsuleToy.objects(
        Q(brand="BANDAI") & (Q(img="") | Q(detail_img=[])) & Q(date__icontains=today)
    )

    # DB 조회 결과를 JSON으로 변환
    result = []
    for capsule in capsules:

        temp_dic = capsule.to_mongo().to_dict()

        result.append(
            {
                "_id": str(temp_dic["_id"]),
                "name": temp_dic["name"],
                "date": temp_dic["date"],
                "price": temp_dic["price"],
                "img": temp_dic["img"],
                "detail_url": temp_dic["detail_url"],
                "detail_img": temp_dic["detail_img"],
                "brand": temp_dic["brand"],
                "description": temp_dic["description"],
            }
        )

    return result
    pass


def update_blank_image(file):
    # JSON 파일 읽기
    try:
        with open(file, "r", encoding="utf-8") as f:
            json_array = json.load(f)
    except Exception as e:
        logging.error(f"File Error: {e}")
        return

    # DB 연결
    connect_to_db()

    for item in json_array:
        # DB 조회
        capsule = CapsuleToy.objects.get(id=ObjectId(item["_id"]))
        if capsule is None:
            logging.info(f"DB Error: {item['name']}")
            continue

        # DB 업데이트
        if capsule.img != item["img"] or capsule.detail_img != item["detail_img"]:
            if capsule.img != item["img"]:
                capsule.img = item["img"]
            if capsule.detail_img != item["detail_img"]:
                capsule.detail_img = item["detail_img"]

            capsule.updatedAt = datetime.now(timezone.utc)

            logging.info(
                f"Success: {capsule.name}, {capsule.img}, {capsule.detail_img}"
            )
            capsule.save()

    pass


if __name__ == "__main__":
    # 기존 DB에서 이미지가 없는 상품 조회
    # 이미지가 없는 상품 조회
    no_image_capsule = get_no_image_capsule()
    write_file(no_image_capsule, CURRENT_DIR + "/0-no-image/")

    # 상세 페이지 정보 수집
    detail_result = get_detail_info(
        CURRENT_DIR + f"/0-no-image/{print_date_format}.json"
    )
    write_file(detail_result, CURRENT_DIR + "/0.25-no-image-detail/")

    # 이미지 수집
    image_result = get_capsule_toy_images(
        CURRENT_DIR + f"/0.25-no-image-detail/{print_date_format}.json"
    )
    write_file(image_result, CURRENT_DIR + f"/0.5-no-image-collect/")

    # 준비중 이미지 필터링
    filtered_image = filter_prepare_image(
        CURRENT_DIR + f"/0.5-no-image-collect/{print_date_format}.json"
    )
    write_file(filtered_image, CURRENT_DIR + f"/0.75-filtered-prepare-image/")

    # DB 갱신
    update_blank_image(
        CURRENT_DIR + f"/0.75-filtered-prepare-image/{print_date_format}.json"
    )

    # WEB에서 새로운 상품 정보 수집
    # 신상 데이터 수집
    daily_result = get_new_items()
    write_file(daily_result, CURRENT_DIR + "/1-daily/")

    # 재판 정보 삽입
    resale_result = insert_resale_product(
        CURRENT_DIR + f"/1-daily/{print_date_format}.json"
    )
    write_file(resale_result, CURRENT_DIR + "/1.5-resale/")

    # DB 내용과 대조, 필터링
    filtered_result = filter_exist_db(
        CURRENT_DIR + f"/1-daily/{print_date_format}.json", "BANDAI"
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

    # 준비중 이미지 필터링
    filtered_image = filter_prepare_image(
        CURRENT_DIR + f"/4-image-collect/{print_date_format}.json"
    )
    write_file(filtered_image, CURRENT_DIR + f"/4.5-filtered-prepare-image/")

    # DB 갱신
    insert_new_product_as_bulk(
        CURRENT_DIR + f"/4.5-filtered-prepare-image/{print_date_format}.json"
    )

    pass
