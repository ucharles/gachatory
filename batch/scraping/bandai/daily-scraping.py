import re
import sys
import requests
from bs4 import BeautifulSoup
from datetime import datetime
from dateutil.relativedelta import relativedelta

import json
import os
import unicodedata
from dotenv import load_dotenv

sys.path.append(
    os.path.dirname(
        os.path.abspath(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))
    )
)

from utils.image_utils import compare_images, save_img
from utils.write_file import write_file
from utils.log import log
from utils.bandai_utils import bandai_first_image_check
from utils.crud_mongodb import (
    search_new_product,
    insert_new_product,
    search_blank_image,
    insert_updated_image,
)

# from utils.google_image_search import google_image_search


# dotenv
load_dotenv()

image_server_path = os.getenv("IMAGE_SERVER_PATH")
absolute_path_bandai = os.getenv("ABSOLUTE_PATH_BANDAI")

bandai_prepare_img = absolute_path_bandai + "bandai-prepare.jpg"


# 이번 달부터 1년치의 상품 리스트를 가져오는 함수
# 가져오는 정보: 브랜드, 상품명, 가격, 출시일, 재출시 여부, 상세 페이지 url
# 이미지, 상세 정보 없음
def bandai_capsule_toy_list():
    capsule_toy_list = []
    temp_dic = {}
    newest = 1

    # 상세 페이지용 url
    url = "https://gashapon.jp/"

    # 이번달 날짜를 YYYYMM 형식으로 출력
    date = datetime.today().strftime("%Y%m")
    end_date = datetime.strptime(date, "%Y%m") + relativedelta(years=1)
    end_date = end_date.strftime("%Y%m")

    # first_page부터 last_page까지 반복
    while True:
        print("Date", date)
        # URL
        search_url = "https://gashapon.jp/schedule/?ym=" + date

        r = requests.get(search_url)
        soup = BeautifulSoup(r.content, "html.parser")

        # 로그 기록
        log(
            "bandai",
            date,
            search_url,
            r.status_code,
            "scraping start",
        )

        # 모든 결과를 담고 있는 div
        result = soup.find("div", class_="contents")

        for detail in result.find_all("div", class_="c-card__list c-card__row --col4"):
            detail_url = detail.find("a").get("href")
            name = detail.find("p", class_="c-card__name").text
            price = detail.find("p", class_="c-card__price").text
            resale = detail.find("div", class_="c-card__resale")

            temp_dic["brand"] = "BANDAI"
            temp_dic["name"] = unicodedata.normalize("NFKC", name)
            temp_dic["date"] = re.sub(r"(\d{4})(\d{2})", r"\1年\2月", date)
            temp_dic["price"] = int(re.sub("[^0-9]", "", price))
            temp_dic["resale"] = False if resale is None else True
            temp_dic["detail_url"] = (url + detail_url.replace("../", "")).replace(
                "https://gashapon.jp/products/detail.php?jan_code=",
                "https://www.bandai.co.jp/catalog/item.php?jan_cd=",
            )

            capsule_toy_list.append(temp_dic)
            temp_dic = {}

        # 페이지 종료마다 파일 저장
        write_file(capsule_toy_list, absolute_path_bandai + "daily-scraping/")
        log(
            "bandai",
            date,
            search_url,
            r.status_code,
            "scraping end",
        )

        # 현재 날짜와 종료 날짜가 같으면 종료
        if date == end_date:
            log(
                "bandai",
                date,
                search_url,
                r.status_code,
                "scraping end",
            )
            break

        # YYYYMM 형식의 날짜를 받아 다음달 날짜를 YYYYMM 형식으로 출력
        date = datetime.strptime(date, "%Y%m") + relativedelta(months=1)
        date = date.strftime("%Y%m")


# 상세 페이지에서 상품 정보를 가져오는 함수
# 가져오는 정보: 이미지, 상세 이미지, 상세 설명
# 이 함수는 gasyapon.jp 기준으로 작성되어 있음
# 변경 필요 부분
# 'https://gashapon.jp/products/detail.php?jan_code='를
# 'https://www.bandai.co.jp/catalog/item.php?jan_cd='로 변경하여 사용하기에
# 스크래핑 코드를 수정함
def bandai_capsule_toy_detail(product, idx=0):
    updated_product = product

    if "date_added" in product:
        # 로그 기록
        log(
            "bandai",
            idx,
            product["detail_url"],
            0,
            "date-added, skip",
        )

        return updated_product

    r = requests.get(product["detail_url"])
    soup = BeautifulSoup(r.content, "html.parser")

    # 로그 기록
    log(
        "bandai",
        idx,
        product["detail_url"],
        r.status_code,
        "scraping start",
    )

    # 이미지 url에서 파일 다운로드 후 저장
    img = soup.find("div", class_="pg-productInfo__thumbnails")
    img_list = img.find_all("img")

    updated_image = []

    for img in img_list:
        img = img.get("src")
        img_loc = (
            image_server_path
            + "images/bandai/"
            + save_img(img, image_server_path + "images/bandai/")
        )

        if img_loc == "":
            continue

        # 준비중 이미지와 유사도 비교
        similarity_score = compare_images(bandai_prepare_img, img_loc)
        # 숫자가 작을 수록 유사도 낮음
        if similarity_score > 0.9:
            os.remove(img_loc)
            continue

        updated_image.append(img_loc.replace(image_server_path, ""))

    # 상품 정보 추출
    description = soup.find("div", class_="pg-productInfo__desc").text

    # 상품 대표 이미지가 존재하는지 확인
    # 반다이는 대표 이미지명에 _1이 붙어 있음
    updated_product["img"] = bandai_first_image_check(updated_image)

    if updated_product["img"] != "":
        updated_image.remove(updated_product["img"])

    updated_product["detail_img"] = updated_image

    updated_product["description"] = description.strip()
    updated_product["lng"] = "ja"
    updated_product["createdAt"] = datetime.utcnow().isoformat()
    updated_product["header"] = ""

    return updated_product


# 대표 이미지가 없는 상품을 찾아서 이미지를 업데이트하는 함수
def bandai_capsule_toy_update_image(product, idx=0):
    updated_product = product

    release_date = re.sub(r"(\d{4})年(\d{2})月(.+)?", r"\1\2", product["date"][0])
    current_date = datetime.today().strftime("%Y%m")

    # release_date가 current_date보다 12개월 이상 차이나면 skip
    if int(current_date) - int(release_date) > 100:
        # 로그 기록
        updated_product["google_search"] = True

        log(
            "bandai",
            idx,
            product["detail_url"],
            0,
            "'requirement of google image search, skip'",
        )

        return updated_product

    r = requests.get(product["detail_url"])
    soup = BeautifulSoup(r.content, "html.parser")

    # 로그 기록
    log(
        "bandai",
        idx,
        product["detail_url"],
        r.status_code,
        "'scraping start'",
    )

    if product["img"] == "":
        img = soup.find("div", class_="pg-productInfo__thumbnails")
        img_list = img.find_all("img")

    updated_image = []

    for img in img_list:
        img = img.get("src")
        img_loc = (
            image_server_path
            + "images/bandai/"
            + save_img(img, image_server_path + "images/bandai/")
        )

        if img_loc == "":
            continue

        # 준비중 이미지와 유사도 비교
        similarity_score = compare_images(bandai_prepare_img, img_loc)
        # 숫자가 작을 수록 유사도 낮음
        if similarity_score > 0.9:
            os.remove(img_loc)
            continue

        updated_image.append(img_loc.replace(image_server_path, ""))

    if updated_image == []:
        # 로그 기록
        log(
            "bandai",
            idx,
            product["detail_url"],
            0,
            "'no image, skip'",
        )

        return updated_product

    # 상품 대표 이미지가 존재하는지 확인
    # 반다이는 대표 이미지명에 _1이 붙어 있음
    updated_product["img"] = bandai_first_image_check(updated_image)

    if updated_product["img"] != "":
        updated_image.remove(updated_product["img"])
        updated_product["image_updated"] = True
        updated_product["updatedAt"] = datetime.utcnow().isoformat()

        # 로그 기록
        log(
            "bandai",
            idx,
            product["detail_url"],
            0,
            "'main image updated'",
        )

    if len(product["detail_img"]) != len(updated_image):
        updated_product["detail_img"] = updated_image
        updated_product["image_updated"] = True
        updated_product["updatedAt"] = datetime.utcnow().isoformat()

        # 로그 기록
        log(
            "bandai",
            idx,
            product["detail_url"],
            0,
            "'detail image updated'",
        )

    return updated_product


def scraping_detail_info(product_list_json, start_idx=0, mode=0):
    updated_product_list = []
    temp_dic = {}
    i = 0

    if mode == 0:
        file_name = absolute_path_bandai + "new-product/detail"
    elif mode == 1:
        file_name = absolute_path_bandai + "blank-img/updated"

    # json 파일 열기
    with open(product_list_json, "r", encoding="utf-8") as f:
        product_list_json = f.read()

        # 리스트로 변환
        product_list = json.loads(product_list_json)

        # 인덱스 추가
        for product in product_list:
            if i >= start_idx:
                if mode == 0:  # 데일리 스크래핑
                    temp_dic = bandai_capsule_toy_detail(product, i)
                elif mode == 1:  # 이미지 업데이트
                    temp_dic = bandai_capsule_toy_update_image(product, i)

                updated_product_list.append(temp_dic)
                write_file(updated_product_list, file_name)
            i += 1
    f.close()


# 이미지가 없는 상품의 이미지를 구글 이미지 검색을 통해 가져오는 함수.
# 셀레니움을 사용하여 첫 번째 이미지를 가져온다.
# 수 회 테스트를 진행했으나, 부정확한 이미지를 가져오는 경우가 많다.
# 어떻게 하면 정확한 이미지를 가져올 수 있을지 고민이 필요하다.
# def bandai_google_image_search(product_list_json):
#     updated_product_list = []
#     temp_dic = {}

#     with open(product_list_json, "r", encoding="utf-8") as f:
#         product_list_json = f.read()

#         # 리스트로 변환
#         product_list = json.loads(product_list_json)

#         # 인덱스 추가
#         for product in product_list:
#             if "google_search" in product and product["google_search"] == True:
#                 name = re.sub(r"[【\[].+[】\]]", "", product["name"])
#                 img_url = google_image_search(name + "+site:chappy-net.com")

#                 if img_url == None:
#                     img_url = ""

#                 try:
#                     img_loc = "images/bandai/" + save_img(img_url, "images/bandai/")
#                 except Exception as e:
#                     print("Can't save image")
#                     img_loc = ""

#                 product["img"] = img_loc.replace("../image-server/contents/", "")

#                 updated_product_list.append(product)
#                 write_file(updated_product_list, "google-image-updated")
#     f.close()


if __name__ == "__main__":
    # 오늘 날짜를 YYYYMMDD 형식으로 출력
    today = datetime.today().strftime("%Y%m%d")
    print(today)
    # 데일리 스크래핑 순서

    # 1. bandai_capsule_toy_list() 실행
    # 이번달부터 1년치의 상품 리스트를 가져온다.
    # 출력 파일은 'daily-scraping-YYYYMMDD.json'
    print("bandai_capsule_toy_list")
    bandai_capsule_toy_list()

    # 2. search_new_product() 실행
    # 입력 파일은 'daily-scraping-YYYYMMDD.json'
    # DB에 저장된 상품 리스트와 비교
    # DB에 저장된 상품이면 기존 dict에 'date_added'를 추가
    # DB에 저장되지 않은 상품이면 별다른 편집 없음
    # 출력 파일은 'new-product-YYYYMMDD.json'
    print("search_new_product")
    write_file(
        search_new_product(absolute_path_bandai + "daily-scraping/" + today + ".json"),
        absolute_path_bandai + "new-product/",
    )

    # 3. scraping_detail_info() 실행
    # 입력 파일은 'new-product-YYYYMMDD.json'
    # 입력 파일의 각 'detail_url'에 접속하여 상품 정보를 가져온다.
    # 출력 파일은 'image-updated-YYYYMMDD.json'
    print("scraping_detail_info")
    scraping_detail_info(
        absolute_path_bandai + "new-product/" + today + ".json", mode=0
    )

    # 4. insert_new_product() 실행
    print("insert_new_product")
    insert_new_product(absolute_path_bandai + "new-product/detail-" + today + ".json")

    # DB에 저장된 상품의 이미지를 업데이트하는 순서

    # 이미지가 없는 상품을 DB에서 찾아 그 결과를 출력하는 함수
    print("search_blank_image")
    write_file(search_blank_image("BANDAI"), absolute_path_bandai + "blank-img/")

    # 이미지가 없는 상품의 상세 페이지에서 이미지를 가져오는 함수
    print("scraping_detail_info")
    scraping_detail_info(absolute_path_bandai + "blank-img/" + today + ".json", mode=1)

    # 가져온 이미지 정보를 DB에 업데이트하는 함수
    print("insert_updated_image")
    insert_updated_image(absolute_path_bandai + "blank-img/updated-" + today + ".json")
