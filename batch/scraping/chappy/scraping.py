from bs4 import BeautifulSoup
import requests
import re
import os
import sys
import json
from datetime import datetime
import unicodedata

sys.path.append(
    os.path.dirname(
        os.path.abspath(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))
    )
)

from utils.write_file import write_file, open_json_file_to_list


enum_category = {107: "reservation"}

chappy_search_url = "https://chappy-net.com/products/list.php"
chappy_detail_url = "https://chappy-net.com"


def chappy_scraping(category_id="", name="", limit=60, page_start=1, page_end=1):
    capsule_toy_list = []
    temp_dic = {}

    pages = list(range(page_start, page_end + 1))

    for page in pages:
        print(f"page: {page}")
        r = requests.get(
            chappy_search_url,
            params={
                "category_id": str(category_id),
                "name": name,
                "disp_number": str(limit),
                "pageno": str(page),
            },
        )

        soup = BeautifulSoup(r.content, "html.parser")

        product_list = soup.find("ul", class_="block clear")
        products = product_list.find_all("li")

        for product in products:
            product_name = product.find("h3", class_="name").text.strip()
            product_name = unicodedata.normalize("NFKC", product_name)
            product_url = chappy_detail_url + product.find("a").get("href")
            price = (
                int(re.search(r"(\d{3,4})円", product_name).group().replace("円", ""))
                if "円" in product_name
                else 0
            )
            date = (
                "2023年" + re.search(r"(\d{1,2})月", product_name).group()
                if "月" in product_name
                else ""
            )
            date = (
                "2023年"
                + re.search(r"(\d{1,2})月延期", product_name).group().replace("延期", "")
                if "延期" in product_name
                else date
            )

            date = re.sub(r"年(\d{1})月", r"年0\1月", date)

            resale = True if "再販" in product_name else False

            if product_name != "":
                temp_dic = {
                    "name": product_name,
                    "date": date,
                    "price": price,
                    "resale": resale,
                    "detail_url": product_url,
                    "createdAt": datetime.utcnow().isoformat(),
                }
                capsule_toy_list.append(temp_dic)

                write_file(capsule_toy_list, "reservation/")
                temp_dic = {}

    return capsule_toy_list


def chappy_detail_scraping(file_name=""):
    print("chappy_detail_scraping")

    product_list = open_json_file_to_list(file_name)

    print("product length:", len(product_list))

    updated_product_list = []
    temp_dic = {}

    image_url = ""

    for idx, product in enumerate(product_list):
        print(idx + "/" + len(product_list), product["detail_url"])
        temp_dic = product

        r = requests.get(product["detail_url"])
        soup = BeautifulSoup(r.content, "html.parser")

        image_area = soup.find("div", class_="imageArea")
        if image_area is not None:
            product["image_url"] = chappy_detail_url + image_area.find(
                "a", class_="expansion"
            ).get("href")

        table = soup.find("table", class_="data mb20")
        if table is not None:
            tr_tags = table.find_all("tr")
            for tr_tag in tr_tags:
                th_tag = tr_tag.find("th")
                if th_tag is not None:
                    if th_tag.text == "メーカー":
                        product["brand"] = tr_tag.find("td").text.strip()

        updated_product_list.append(product)
        write_file(updated_product_list, "reservation/detail")


def chappy_brand_list(file_name):
    print("chappy_brand_list")

    brand_dic = {}

    product_list = open_json_file_to_list(file_name)

    for product in product_list:
        if product["brand"] not in brand_dic:
            brand_dic[product["brand"]] = 1
        else:
            brand_dic[product["brand"]] += 1

    write_file(brand_dic, "reservation/brand")
    return brand_dic


def chappy_export_brand_list(file_name, brand_list=[]):
    print("chappy_export_brand_list")

    export_brand_list = []
    temp_dic = {}

    product_list = open_json_file_to_list(file_name)

    for product in product_list:
        if product["brand"] in brand_list:
            temp_dic = product
            export_brand_list.append(temp_dic)
            temp_dic = {}

    brand_name_str = "-".join(brand_list)

    write_file(export_brand_list, "reservation/brand-" + brand_name_str)
    return export_brand_list


if __name__ == "__main__":
    # chappy_scraping(category_id=107, page_end=13)
    # chappy_detail_scraping("./reservation/20230903.json")
    chappy_brand_list("./reservation/detail-20230903.json")
    chappy_export_brand_list("./reservation/detail-20230903.json", ["その他"])
