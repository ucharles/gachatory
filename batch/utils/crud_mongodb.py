import os
import sys
import re
from bson import ObjectId
import json
from dotenv import load_dotenv
from datetime import datetime

from mongoengine import (
    connect,
    DynamicDocument,
    StringField,
    IntField,
    ListField,
    DateTimeField,
)
from mongoengine.queryset.visitor import Q
from pymongo import UpdateOne

sys.path.append(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))


# utils
from utils.write_file import write_file
from utils.log import log
from utils.date_convert_to_ISO import date_convert_to_iso, format_month

# models
from models.capsule_toy import CapsuleToy, CapsuleTag, Localization

# tagging
from tagging.tagging_with_chatgpt import flag_capsule_toy

# dotenv
load_dotenv()

database_url = os.getenv("DATABASE_URL")
database_name = os.getenv("DATABASE_NAME")

import logging

# 로깅 기본 설정: 로그 레벨, 로그 포맷 및 날짜 포맷 지정
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)


def search_new_product(file_name):
    # Connect to MongoDB
    connect(
        db=database_name,
        host=database_url,
        alias="default",
    )

    # json 파일 열기
    with open(file_name, "r", encoding="utf-8") as f:
        product_list = json.load(f)

    new_product_list = []

    for product in product_list:
        capsule = CapsuleToy.objects(
            Q(brand=product["brand"])
            & (Q(name=product["name"]) | Q(detail_url=product["detail_url"]))
        ).first()

        if capsule:
            if product["resale"] == True:
                # 이미 재판 정보가 갱신된 경우 패스
                # 제품 정보가 DB에 이미 포함된 경우
                if product["date"] in capsule["date"]:
                    continue

                date = [product["date"]] + capsule["date"]

                new_product_list.append(
                    {
                        "brand": product["brand"],
                        "name": product["name"],
                        "date": date,
                        "detail_url": product["detail_url"],
                        "resale": True,
                        "date_added": True,
                    }
                )

                log(product["brand"], product["name"], "", 0, "resale data update")
            else:
                continue
        else:
            new_product_list.append(product)
            log(product["brand"], product["name"], "", 0, "new data insert")

    return new_product_list


def insert_new_product(file_name):
    # Connect to MongoDB
    connect(
        db=database_name,
        host=database_url,
        alias="default",
    )

    try:
        # json 파일 열기
        with open(file_name, "r", encoding="utf-8") as f:
            product_list = json.load(f)
    except:
        print("No new product")
        return

    new_product_list = []

    for product in product_list:
        # dict에 date_added가 있으면
        if "date_added" in product:
            # DB를 검색하여 해당 상품이 존재하는지 확인
            capsule = CapsuleToy.objects(
                Q(brand=product["brand"])
                & (Q(name=product["name"]) | Q(detail_url=product["detail_url"]))
            ).first()

            # 해당 상품이 존재하면
            if capsule:
                print(capsule["dateISO"])
                print(product["date"][0])
                print(date_convert_to_iso(product["date"][0]))

                dateISO = capsule["dateISO"] + [date_convert_to_iso(product["date"][0])]
                # DB에 재판 날짜 정보 추가
                capsule.update(date=product["date"])
                capsule.update(dateISO=dateISO)
                log(product["brand"], product["name"], "", 0, "resale data update")

        # dict에 date_added가 없으면
        else:
            # dict에 부족한 데이터를 보강, 보강이 없으면 에러 발생
            if "header" not in product:
                product["header"] = ""

            # mongodb에 새 데이터 삽입
            capsule = CapsuleToy(
                brand=product["brand"],
                name=product["name"],
                price=product["price"],
                date=[product["date"]],
                header=product["header"],
                description=product["description"],
                img=product["img"],
                detail_img=product["detail_img"],
                detail_url=product["detail_url"],
                lng=product["lng"],
                createdAt=datetime.utcnow().isoformat(),
                dateISO=[product["dateISO"]],
            )
            # DB에 저장
            capsule.save()
            log(product["brand"], product["name"], "", 0, "new data insert")
            logging.info(f"New product inserted: {product['name']}")


def insert_new_product_as_bulk(file_name):
    try:
        connect(
            db=database_name,
            host=database_url,
            alias="default",
        )
    except Exception as e:
        logging.error(f"DB Connection Error: {e}")
        return
    try:
        # json 파일 열기
        with open(file_name, "r", encoding="utf-8") as f:
            product_list = json.load(f)
    except Exception as e:
        logging.error(f"File Error: {e}")
        return

    product_list.reverse()
    new_product_list = []

    try:
        for product in product_list:
            insert_date = (
                product["date"] if type(product["date"]) == list else [product["date"]]
            )
            insert_dateISO = (
                product["dateISO"]
                if type(product["dateISO"]) == list
                else [product["dateISO"]]
            )
            new_product = CapsuleToy(
                brand=product["brand"],
                name=product["name"],
                price=product["price"],
                date=insert_date,
                header=product["header"],
                description=product["description"],
                img=product["img"],
                detail_img=product["detail_img"],
                detail_url=product["detail_url"],
                lng=product["lng"],
                createdAt=datetime.utcnow().isoformat(),
                updatedAt=datetime.utcnow().isoformat(),
                releaseUpdateDate=datetime.utcnow().isoformat(),
                dateISO=insert_dateISO,
            )

            logging.info(f"New product inserted: {product['name']}")
            new_product_list.append(new_product)

        CapsuleToy.objects.insert(new_product_list)
        logging.info(f"New products inserted: {len(new_product_list)}")
    except Exception as e:
        logging.error(f"Error inserting new product: {e}")
        return


def search_blank_image(brand):
    # Connect to MongoDB
    connect(
        db=database_name,
        host=database_url,
        alias="default",
    )
    print("Brand", brand)

    # CapsuleToy 모델에서 데이터 검색
    # 파라미터인 brand와 img, detail_img가 빈 값인 데이터 검색
    capsules = CapsuleToy.objects(
        Q(brand=brand, img="")
        | (
            Q(brand=brand)
            & Q(brand=brand, img="")
            & (Q(detail_img__size=0) | Q(detail_img__exists=True))
        )
    )
    print("capsule", capsules)
    capsule_list = []

    # 검색된 데이터가 있으면
    if capsules:
        # 검색된 데이터를 리스트로 변환
        for capsule in capsules:
            capsule_to_dict = capsule.to_mongo().to_dict()
            result_capsule = {
                "_id": {"$oid": str(capsule_to_dict["_id"])},
                "brand": capsule_to_dict["brand"],
                "name": capsule_to_dict["name"],
                "price": capsule_to_dict["price"],
                "date": capsule_to_dict["date"],
                "img": capsule_to_dict["img"],
                "detail_img": capsule_to_dict["detail_img"],
                "detail_url": capsule_to_dict["detail_url"].replace(
                    "https://gashapon.jp/products/detail.php?jan_code=",
                    "https://www.bandai.co.jp/catalog/item.php?jan_cd=",
                ),
            }
            if "header" in capsule_to_dict:
                result_capsule["header"] = capsule_to_dict["header"]
            if "createdAt" in capsule_to_dict:
                result_capsule["createdAt"] = capsule_to_dict["createdAt"].isoformat()
            if "updatedAt" in capsule_to_dict:
                result_capsule["updatedAt"] = capsule_to_dict["updatedAt"].isoformat()

            capsule_list.append(result_capsule)
        print("capsule_list", result_capsule)

    return capsule_list


def insert_updated_image(file_name):
    # Connect to MongoDB
    connect(
        db=database_name,
        host=database_url,
        alias="default",
    )

    try:
        # json 파일 열기
        with open(file_name, "r", encoding="utf-8") as f:
            product_list = json.load(f)
    except:
        print("No product of which image is updated")
        return

    for product in product_list:
        # dict에 date_added가 있으면
        if "image_updated" in product:
            capsule = CapsuleToy.objects(
                id=ObjectId(product["_id"]["$oid"]),
            ).first()
            print("capsule", capsule.to_mongo().to_dict())

            # 해당 상품이 존재하면
            if capsule:
                # mongoengine에서 updatedAt 필드는 해당 동작을 구체적으로 정의하고 처리하지 않는 한 update 함수를 사용할 때 자동으로 업데이트되지 않음.
                capsule.update(
                    img=product["img"],
                    detail_img=product["detail_img"],
                    updatedAt=datetime.utcnow().isoformat(),
                )
                log(product["brand"], product["name"], "", 0, "'image data updated'")


def insert_new_tag(file_name):

    try:
        # json 파일 열기
        with open(file_name, "r", encoding="utf-8") as f:
            capsule_list = json.load(f)
    except Exception as e:
        print(e)
        return

    # MongoDB에 연결
    try:
        connect(
            db=database_name,
            host=database_url,
            alias="default",
        )
        print("DB Connection Success")
    except Exception as e:
        print(f"DB Connection Error: {e}")
        return

    for capsule in capsule_list:
        # 태그 정보에 id가 있으면
        if capsule["id"] is not None:
            flag = flag_capsule_toy(capsule["id"])

        # 해당 태그가 존재하지 않으면
        for tag in capsule["tags"]:
            # dict에 date_added가 있으면
            capsule_tag = CapsuleTag.objects(ja=tag["ja"]).first()

            if capsule_tag:
                print("already exist capsule_tag", capsule_tag.to_mongo().to_dict())

            if capsule_tag is None:
                CapsuleTag(
                    ja=tag["ja"],
                    ko=tag["ko"],
                    en=tag["en"],
                    property=tag["property"],
                    linkCount=0,
                    createdAt=datetime.utcnow().isoformat(),
                ).save()
                print("new capsule_tag", tag)


def search_capsule_toy_and_update_tag():
    try:
        connect(
            db=database_name,
            host=database_url,
            alias="default",
        )
    except Exception as e:
        logging.error(f"DB Connection Error: {e}")
        return

    # 태그 부여 로직
    # 1. 새로운 태그는 모든 캡슐 토이를 검사
    # 2. 새로운 태그가 없는 경우, 태그가 없는 캡슐 토이를 검사

    # 위 두 로직을 분리해야 하나?
    # 새로운 태그 / 기존 태그 (count가 1 이상)를 분리하긴 해야할 듯.
    # 쿼리를 2번 쓰는게 이득인가
    # 반복문을 사용하여 캡슐 토이를 하나씩 검사하는 것이 더 이득인가

    capsule_tags = CapsuleTag.objects()
    for capsule_tag in capsule_tags:
        count = 0
        # print("capsule_tag:", capsule_tag.to_mongo().to_dict())
        tag_info = capsule_tag.to_mongo().to_dict()
        regex = "|".join(tag_info["ja"])
        logging.info(f"regex: {regex}")
        logging.info(
            f"tag_info: {tag_info['_id']}, {tag_info['ja']}, linkCount: {tag_info['linkCount']}"
        )

        try:
            # 새로운 태그인 경우. 태그가 없는 캡슐 토이를 검사
            if tag_info.get("linkCount", 0) == 0:
                capsule_toys = CapsuleToy.objects(
                    (
                        Q(tagId__nin=[tag_info["_id"]])
                        | Q(tagId__exists=False)
                        | Q(tagId__size=0)
                    )
                    & (Q(name__regex=regex) | Q(description__regex=regex))
                )
                logging.info(f"New Tag: {tag_info['ja']}")

            # 기존 태그인 경우. Localization 정보가 없는 캡슐 토이를 검사
            else:
                capsule_toys = CapsuleToy.objects(
                    (Q(localization=None) | Q(localization=[]))
                )
                logging.info(f"Existing Tag: {tag_info['ja']}")
        except Exception as e:
            print(f"DB Query Error: {e}")
            continue

        bulk_operation = []

        for capsule_toy in capsule_toys:
            # print("capsule_toy:", capsule_toy.to_mongo().to_dict())
            # if tag_info["_id"]가 capsule_toy["tagId"]에 이미 존재하면
            capsule_info = capsule_toy.to_mongo().to_dict()
            if tag_info["_id"] in capsule_info["tagId"]:
                logging.info(f"Tag already exists: {tag_info['ja']}")
                continue

            # capsule_toy.update(
            #     push__tagId=tag_info["_id"], updatedAt=datetime.utcnow().isoformat()
            # )
            bulk_operation.append(
                UpdateOne(
                    {"_id": capsule_info["_id"]},
                    {
                        "$push": {"tagId": tag_info["_id"]},
                        "$set": {
                            "updatedAt": datetime.utcnow()
                        },  # datetime.utcnow().isoformat() -> datetime.utcnow() / isoformat()을 사용할 경우 string 형식으로 저장됨
                    },
                )
            )
            count = count + 1
            # print("capsule_toy:", capsule_toy.to_mongo().to_dict()["name"])
            logging.info(
                f"Tag adding: {tag_info['ja']}, {capsule_info['_id']}, {capsule_info['name']}"
            )

        logging.info(f"Tag added: {tag_info['ja']}, {count} items")
        if len(bulk_operation) > 0:
            # logging.info(f"{bulk_operation}")
            CapsuleToy._get_collection().bulk_write(bulk_operation, ordered=False)

        # tagId가 추가된 경우 count 증가
        if count > 0:
            capsule_tag.update(inc__linkCount=count)
            # print("count:", count)
            logging.info(f"tag: {tag_info['ja']} count: {count}")


def search_capsule_toy_in_duplicate_tag():
    connect(
        db=database_name,
        host=database_url,
        alias="default",
    )

    capsule_toys = CapsuleToy.objects()

    for capsule_toy in capsule_toys:
        # if capsule_toy["tagId"]에 중복된 값이 있으면
        if len(capsule_toy["tagId"]) != len(set(capsule_toy["tagId"])):
            # 중복된 값 제거
            capsule_toy.update(tagId=list(set(capsule_toy["tagId"])))
            print("capsule_toy:", capsule_toy.to_mongo().to_dict()["name"])


def filter_exist_db(json_array_file, brand=""):
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
        items = CapsuleToy.objects(Q(brand__icontains=brand))
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


def str_to_date():
    # connect to db
    try:
        connect(database_name, host=database_url)
        logging.info("DB Connection Success")
    except Exception as e:
        logging.error(f"DB Connection Error: {e}")
        return

    # get all items
    try:
        items = CapsuleToy.objects(Q(updatedAt__type="string"))
    except Exception as e:
        logging.error(f"DB Query Error: {e}")
        return

    bulk_operation = []

    for item in items:
        # 문자열에서 datetime 객체로 변환
        updated_at_datetime = datetime.fromisoformat(item.updatedAt)

        bulk_operation.append(
            UpdateOne(
                {"_id": item.id},
                {"$set": {"updatedAt": updated_at_datetime}},
            )
        )
        logging.info(f"Item: {item.name}, {item.updatedAt}")

    if len(bulk_operation) > 0:
        CapsuleToy._get_collection().bulk_write(bulk_operation, ordered=False)
        logging.info(f"Updated: {len(bulk_operation)} items")

    return


def line_break_remover():
    # connect to db
    try:
        connect(database_name, host=database_url)
        logging.info("DB Connection Success")
    except Exception as e:
        logging.error(f"DB Connection Error: {e}")
        return

    # get all items
    try:
        capsules = CapsuleToy.objects(
            (Q(description__contains="\n") | Q(name__contains="\n"))
        )
        localizations = Localization.objects(
            (Q(description__contains="\n") | Q(name__contains="\n"))
        )
    except Exception as e:
        logging.error(f"DB Query Error: {e}")
        return

    capsule_bulk_operation = []
    localization_bulk_operation = []

    for capsule in capsules:
        logging.info(f"Item: {capsule.name}, {capsule.description}")
        capsule_bulk_operation.append(
            UpdateOne(
                {"_id": capsule.id},
                {
                    "$set": {
                        "description": capsule.description.replace("\n", "").replace(
                            r"\s+", " "
                        ),
                        "name": capsule.name.replace("\n", "").replace(r"\s+", " "),
                    }
                },
            )
        )

    for localization in localizations:
        logging.info(f"Item: {localization.name}, {localization.description}")
        localization_bulk_operation.append(
            UpdateOne(
                {"_id": localization.id},
                {
                    "$set": {
                        "description": localization.description.replace(
                            "\n", " "
                        ).replace(r"\s+", " "),
                        "name": localization.name.replace("\n", " ").replace(
                            r"\s+", " "
                        ),
                    }
                },
            )
        )

    if len(capsule_bulk_operation) > 0:
        CapsuleToy._get_collection().bulk_write(capsule_bulk_operation, ordered=False)
        logging.info(f"Capsule Updated: {len(capsule_bulk_operation)} items")

    if len(localization_bulk_operation) > 0:
        Localization._get_collection().bulk_write(
            localization_bulk_operation, ordered=False
        )
        logging.info(f"Localization Updated: {len(localization_bulk_operation)} items")

    return


if __name__ == "__main__":
    # insert_new_product(
    #     "/home/local-optimum/git/gachatory/batch/scraping/bandai/new-product/detail-20231202.json"
    # )
    # insert_updated_image("updated_image.json")
    # insert_new_tag("E:/Git/gachatory/batch/tagging/tag-list-translated-edited-20230915.json")
    # search_capsule_toy_and_update_tag()
    # insert_new_tag("E:/Git/gachatory/batch/tagging/tagging_result-033838-20240303.json")

    # insert_new_product_as_bulk(
    #     "E:/Git/gachatory/batch/scraping/tarlin/detail-img-20240308.json"
    # )
    pass
