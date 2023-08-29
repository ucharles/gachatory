import requests
from bs4 import BeautifulSoup
import re
import json
from datetime import datetime
import os
import math


from PIL import Image
import numpy as np

kitan_prepare_img = "./kitan-prepare.png"


def mse(image1, image2):
    try:
        img1 = Image.open(image1)
        img2 = Image.open(image2)

        # Convert images to grayscale for comparison
        img1 = img1.convert("L")
        img2 = img2.convert("L")

        # Convert images to NumPy arrays
        array1 = np.array(img1)
        array2 = np.array(img2)

        # Calculate MSE
        mse_value = np.mean((array1 - array2) ** 2)
    except:
        log("error", 0, "", 0, "img error" + image1 + ", " + image2)
        mse_value = 0
    finally:
        return mse_value


# URL 이미지 저장 함수, img 폴더에 저장
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


def write_file(list, first="", last=""):
    fo = open("product_list.json", "w", encoding="utf-8")
    fo.write(json.dumps(list, ensure_ascii=False))
    fo.close()


def log(maker, page, url, status_code, msg=""):
    now = datetime.now()
    nowDate = now.strftime("%Y%m%d")
    nowDatetime = now.strftime("%Y%m%d-%H%M%S")

    f = open(maker + "_" + nowDate + ".txt", "a", encoding="utf-8")
    f.write("date: " + nowDatetime + ",")
    f.write("maker: " + maker + ",")
    f.write("page: " + str(page) + ",")
    f.write("status_code: " + str(status_code) + ",")
    f.write("url: '" + url + "'")
    if msg != "":
        f.write(",msg: " + msg + "\n")
    else:
        f.write("\n")
    f.close()


def korokoro_capsule_toy_list(first_page=1, last_page=85):
    image_list = []
    text_list = []
    capsule_toy_list = []

    temp_dic = {}
    newest = 1

    # 상세 페이지용 URL
    url = "https://www.ip4.co.jp/"

    # first_page부터 last_page까지 반복
    for page in range(first_page, last_page + 1):
        # URL
        search_url = "https://www.ip4.co.jp/cupsuletoy_top/page/" + str(page)

        r = requests.get(search_url)
        soup = BeautifulSoup(r.content, "html.parser")

        # 로그 기록
        log(
            "korokoro",
            page,
            search_url,
            r.status_code,
            "scraping start",
        )

        list_result = soup.find("div", class_="list-main fcb")

        # 텍스트 저장 작업
        for detail in list_result.find_all("li"):
            # h3 = name, p[0] = price, p[1] = date
            detail_url = detail.find("a")
            dl_tag = detail.find("dl", class_="jmh")

            for dt_tag, dd_tag in zip(dl_tag.find_all("dt"), dl_tag.find_all("dd")):
                date = dt_tag.text
                brand = dd_tag.find("div", class_="brand")
                copy = dd_tag.find("div", class_="copy")

                if brand is None:
                    brand = ""
                else:
                    brand = brand.text

                if copy is None:
                    copy = ""
                else:
                    copy = copy.text.strip()

                name = (
                    brand
                    + "　"
                    + dd_tag.text.replace(copy, "").replace(brand, "").strip()
                )
                description = re.sub(r"\t+", "　", copy)

            temp_dic["brand"] = "KOROKORO"
            temp_dic["name"] = name
            temp_dic["date"] = re.sub(r"年(\d)月", r"年0\1月", date)
            temp_dic["detail_url"] = detail_url.get("href")
            temp_dic["description"] = description
            if first_page == 1 & newest == 1:
                temp_dic["newest"] = True
                newest = 0

            capsule_toy_list.append(temp_dic)
            temp_dic = {}

        # 페이지 종료마다 파일 저장
        write_file(capsule_toy_list)
        log("korokoro", page, search_url, r.status_code, "scraping end")


def korokoro_capsule_toy_detail(product, brand_name, idx=0):
    updated_product = product

    brand_img_loc = "images/" + brand_name + "/"

    r = requests.get(product["detail_url"])
    soup = BeautifulSoup(r.content, "html.parser")

    url_last_item = re.search(r"/([^/]+)/?$", product["detail_url"]).group(1)

    detail_image_list = []

    img_count = 1

    # 로그 기록
    log(
        brand_name,
        idx,
        product["detail_url"],
        r.status_code,
        "scraping start",
    )

    image_list = soup.find("ul", class_="fcb")

    detail_image = image_list.find_all("img")

    detail_info = soup.find("div", class_="data-read")

    description = detail_info.find("p").text

    price = detail_info.find("p", class_="cash").text

    copy = detail_info.find("p", class_="copy").text

    # 이미지 url에서 파일 다운로드 후 저장
    for img in detail_image:
        img = img.get("src")

        if img_count == 1:
            img_loc = brand_img_loc + save_img(img, brand_img_loc)
        else:
            detail_img_loc = brand_img_loc + save_img(img, brand_img_loc)
            detail_image_list.append(detail_img_loc)
        img_count += 1

    description = description.strip().replace("\n", "").replace("  ", "")
    description = re.sub(r"\s?([「」、\(\)（）])\s?", r"\1", description)

    price = re.search(r"\d{3,4}円", price).group().replace("円", "")
    price = int(price)

    description = description + copy.strip()

    updated_product["price"] = price
    updated_product["description"] = description
    updated_product["img"] = img_loc
    updated_product["detail_img"] = detail_image_list
    updated_product["loc"] = "ja"
    updated_product["createdAt"] = datetime.utcnow().isoformat()

    return updated_product


def takaratomy_capsule_toy_list(first_page=1, last_page=51):
    capsule_toy_list = []
    temp_dic = {}
    newest = 1

    url = "https://www.takaratomy-arts.co.jp"

    # first_page부터 last_page까지 반복
    for page in range(first_page, last_page + 1):
        # URL
        search_url = (
            "https://www.takaratomy-arts.co.jp/items/gacha/search.html?p=" + str(page)
        )

        r = requests.get(search_url)
        soup = BeautifulSoup(r.content, "html.parser")

        # 로그 기록
        log("takaratomy", page, search_url, r.status_code, "scraping start")

        result = soup.find("div", class_="dbitems")

        for detail in result.find_all("a"):
            detail_url = url + detail.get("href")

            # 이미지 url에서 파일 다운로드 후 저장
            img = detail.find("img").get("src")
            img_loc = "./img/" + save_img(url + img, "img")

            # bottoms에 저장된 상품 정보 추출
            # h3 = name, p[0] = price, p[1] = date
            bottoms = detail.find("div", class_="bottoms")

            name = bottoms.find("h3").text
            price_date = bottoms.find_all("p")

            # 가격 정보 추출 후 숫자만 남기기
            price = price_date[0].text
            price = re.sub("[^0-9]", "", price)

            # 날짜 정보 추출 후 "発売時期:" 제외
            date = price_date[1].text
            date = date.replace("発売時期:", "")

            temp_dic["brand"] = "Takara Tomy Arts"
            temp_dic["name"] = name
            temp_dic["price"] = price
            temp_dic["date"] = date
            temp_dic["detail_img"] = img_loc
            temp_dic["detail_url"] = detail_url
            if first_page == 1 & newest == 1:
                temp_dic["newest"] = True
                newest = 0

            capsule_toy_list.append(temp_dic)
            temp_dic = {}

        # 페이지 종료마다 파일 저장
        write_file(capsule_toy_list)
        log(
            "takaratomy",
            page,
            search_url,
            r.status_code,
            "scraping end",
        )


# 상품 상세 정보 추출(img, header, description)
# parameter : product(dict)
def takaratomy_capsule_toy_detail(product, idx=0):
    updated_product = product

    r = requests.get(product["detail_url"])
    soup = BeautifulSoup(r.content, "html.parser")

    # 로그 기록
    log(
        "takaratomy",
        idx,
        product["detail_url"],
        r.status_code,
        "scraping start",
    )

    # 헤더 추출
    header = soup.find("div", class_="head").find("h3").text

    # 이미지 url에서 파일 다운로드 후 저장
    img = soup.find("div", class_="imgWrap").find("img").get("src")
    img_loc = "./info-img/" + save_img(img, "info-img")

    # 상품 정보 추출
    description = soup.find("div", class_="summary")
    if description.find("p") is None:
        description = description.text
    else:
        description = description.find("p").text

    # 상품 정보에서 줄바꿈 제거
    description = description.replace("」\r\n", "」、")

    updated_product["img"] = img_loc
    updated_product["header"] = header
    updated_product["description"] = description

    return updated_product


def bandai_capsule_toy_detail(product, idx=0):
    updated_product = product

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
        img_loc = "./img/" + save_img(img, "img")

        if img_loc == "":
            continue
        # 준비중 이미지와 유사도 비교
        similarity_score = mse(baindai_prepare_img, img_loc)
        # 숫자가 작을 수록 유사도 높음
        if similarity_score < 1:
            os.remove(img_loc)
            img_loc = ""

        updated_image.append(img_loc)

    # 상품 정보 추출
    description = soup.find("div", class_="pg-productInfo__desc").text

    updated_product["img"] = updated_image[0]
    if len(updated_image) > 1:
        updated_product["detail_img"] = updated_image[1:]
    updated_product["description"] = description.strip()

    return updated_product


def scraping_detail_info(product_list_json, start_idx=0):
    updated_product_list = []
    temp_dic = {}
    i = 0

    # json 파일 열기
    with open(product_list_json, "r", encoding="utf-8") as f:
        product_list_json = f.read()

        # 리스트로 변환
        product_list = json.loads(product_list_json)

        # 인덱스 추가
        for product in product_list:
            if i >= start_idx:
                if product["brand"] == "BANDAI":
                    temp_dic = bandai_capsule_toy_detail(product, i)
                elif product["brand"] == "Takara Tomy Arts":
                    temp_dic = takaratomy_capsule_toy_detail(product, i)
                elif product["brand"] == "KITAN CLUB":
                    temp_dic = kitan_capsule_toy_detail(product, i)
                elif product["brand"] == "BUSHIROAD CREATIVE":
                    temp_dic = bushiroad_capsule_toy_detail(product, i)
                elif product["brand"] == "KOROKORO":
                    temp_dic = korokoro_capsule_toy_detail(product, "korokoro", i)

                updated_product_list.append(temp_dic)
                write_file(updated_product_list)
            i += 1
    f.close()


# korokoro_capsule_toy_list()
scraping_detail_info("data.json")
