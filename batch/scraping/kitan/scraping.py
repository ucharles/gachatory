import requests
from bs4 import BeautifulSoup
import re
import json
from datetime import datetime
import os


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


def kitan_capsule_toy_list(first_page=2010, last_page=2023):
    image_list = []
    text_list = []
    capsule_toy_list = []

    temp_dic = {}
    newest = 1

    url = "https://kitan.jp/products/"

    # first_page부터 last_page까지 반복
    for page in range(first_page, last_page + 1):
        # URL
        search_url = "https://kitan.jp/product_age/" + str(page)

        r = requests.get(search_url)
        soup = BeautifulSoup(r.content, "html.parser")

        # 로그 기록
        log("kitan", page, search_url, r.status_code, "scraping start")

        image_result = soup.find("div", class_="c-productBox__area")
        text_result = soup.find("div", attrs={"category": "capsule"})

        # 이미지 저장 작업
        # 이미지 순서가 밀리는 경우가 있어 수집 전략을 변경하여, 상세 페이지에서 이미지를 수집.
        # for detail in image_result.find_all("figure", class_="c-productBox__thum"):
        #     # 이미지 url에서 파일 다운로드 후 저장
        #     detail_image_url = detail.find("img").get("src")
        #     img_loc = "./images/kitan/" + save_img(detail_image_url, "images/kitan/")

        #     temp_dic["img"] = img_loc
        #     if first_page == 1 & newest == 1:
        #         temp_dic["newest"] = True
        #         newest = 0

        #     image_list.append(temp_dic)
        #     temp_dic = {}

        # 텍스트 저장 작업
        for detail in text_result.find_all("li", class_="cat-item cat-item02"):
            # h3 = name, p[0] = price, p[1] = date
            detail_info = detail.find("a")
            name = detail_info.text
            detail_url = detail_info.get("href")

            temp_dic["name"] = name.strip()
            temp_dic["detail_url"] = detail_url
            if first_page == 1 & newest == 1:
                temp_dic["newest"] = True
                newest = 0

            text_list.append(temp_dic)
            temp_dic = {}

        # 이미지와 텍스트 합치기
        for i in range(len(text_list)):
            capsule_toy_list.append(
                {
                    "brand": "KITAN CLUB",
                    "name": text_list[i]["name"],
                    "detail_url": text_list[i]["detail_url"],
                }
            )

        # 페이지 종료마다 파일 저장
        write_file(capsule_toy_list)
        log("kitan", page, search_url, r.status_code, "scraping end")


def kitan_capsule_toy_detail(product, idx=0):
    updated_product = product

    r = requests.get(product["detail_url"])
    soup = BeautifulSoup(r.content, "html.parser")

    url_last_item = re.search(r"/([^/]+)/?$", product["detail_url"]).group(1)

    detail_image_list = []

    img_count = 1

    # 로그 기록
    log(
        "kitan",
        idx,
        product["detail_url"],
        r.status_code,
        "scraping start",
    )

    thum_image = soup.find("div", class_="c-productDetail__thum")

    detail_image = soup.find("div", class_="c-productDetail__pickup")

    detail_info = soup.find("div", class_="c-productDetail__desc")

    description = detail_info.find("div", class_="c-productDetail__text")

    product_info = detail_info.find("div", class_="c-productDetail__detail")

    # 이미지 url에서 파일 다운로드 후 저장
    img = thum_image.find("img").get("src")
    img_loc = "images/kitan/" + save_img(
        img, "images/kitan/", url_last_item + "_" + str(img_count).zfill(2)
    )

    img_count += 1

    # 상품 정보 추출
    if description.find("p") is None:
        description = description.text
    else:
        description = description.find("p").text

    description = description.strip().replace("\n", "").replace("  ", "")
    description = re.sub(r"\s?([「」、\(\)（）])\s?", r"\1", description)

    for dl_tag in product_info.find_all("dl"):
        for dt_tag, dd_tag in zip(dl_tag.find_all("dt"), dl_tag.find_all("dd")):
            if dt_tag.text == "発売日":
                date = re.sub(r"年(\d)月", r"年0\1月", dd_tag.text)
            elif dt_tag.text == "価格":
                price = re.search(r"\d{3}円", dd_tag.text).group().replace("円", "")
                price = int(price)

    for img in detail_image.find_all("img"):
        detail_img = img.get("src")
        detail_img_loc = "images/kitan/" + save_img(
            detail_img,
            "images/kitan/",
            url_last_item + "_" + str(img_count).zfill(2),
        )
        img_count += 1

        detail_image_list.append(detail_img_loc)

    updated_product["date"] = date
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

                updated_product_list.append(temp_dic)
                write_file(updated_product_list)
            i += 1
    f.close()


scraping_detail_info("data.json")
