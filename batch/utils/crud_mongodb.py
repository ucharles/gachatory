import os
import sys
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

sys.path.append(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))


# utils
from utils.write_file import write_file
from utils.log import log

# models
from models.capsule_toy import CapsuleToy, CapsuleTag

# dotenv
load_dotenv()

database_url = os.getenv("DATABASE_URL")
database_name = os.getenv("DATABASE_NAME")


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
            Q(brand=product["brand"]) &( Q(name=product["name"]) | Q(detail_url=product["detail_url"]))).first()

        if capsule:
            if product["resale"] == True:
                # 이미 재판 정보가 갱신된 경우 패스
                # 제품 정보가 DB에 이미 포함된 경우
                if product["date"] in capsule["date"]:
                    continue

                date = [product["date"]] + capsule["date"]
                dateISO = [product["dateISO"]] + capsule["dateISO"]
                new_product_list.append(
                    {
                        "brand": product["brand"],
                        "name": product["name"],
                        "date": date,
                        "detail_url": product["detail_url"],
                        "resale": True,
                        "date_added": True,
                        "dateISO": dateISO,
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
                Q(brand=product["brand"]) &( Q(name=product["name"]) | Q(detail_url=product["detail_url"]))).first()

            # 해당 상품이 존재하면
            if capsule:
                # DB에 재판 날짜 정보 추가
                capsule.update(date=product["date"])
                capsule.update(dateISO=product["dateISO"])
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
                createdAt=product["createdAt"],
                dateISO=[product["dateISO"]],
            )
            # DB에 저장
            capsule.save()
            log(product["brand"], product["name"], "", 0, "new data insert")


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
    # Connect to MongoDB
    connect(
        db=database_name,
        host=database_url,
        alias="default",
    )

    try:
        # json 파일 열기
        with open(file_name, "r", encoding="utf-8") as f:
            tag_list = json.load(f)
    except Exception as e:
        print(e)
        return

    for tag in tag_list:
        # dict에 date_added가 있으면
        capsule_tag = CapsuleTag.objects(ja=tag["ja"]).first()

        if capsule_tag:
            print("capsule_tag", capsule_tag.to_mongo().to_dict())

        # 해당 태그가 존재하지 않으면
        if capsule_tag is None:
            CapsuleTag(
                ja=tag["ja"],
                ko=tag["ko"],
                en=tag["en"],
                property=tag["property"],
                linkCount=0,
                createdAt=datetime.utcnow().isoformat(),
            ).save()


def search_capsule_toy_and_update_tag():
    connect(
        db=database_name,
        host=database_url,
        alias="default",
    )

    capsule_tags = CapsuleTag.objects(linkCount=0)
    for capsule_tag in capsule_tags:
        count = 0
        # print("capsule_tag:", capsule_tag.to_mongo().to_dict())
        tag_info = capsule_tag.to_mongo().to_dict()
        regex = "|".join(tag_info["ja"])
        print("regex:", regex)
        print("tag_info:", tag_info)

        capsule_toys = CapsuleToy.objects(
            Q(name__regex=regex) | Q(description__regex=regex)
        )

        for capsule_toy in capsule_toys:
            capsule_toy.update(
                push__tagId=tag_info["_id"], updatedAt=datetime.utcnow().isoformat()
            )
            count = count + 1
            print("capsule_toy:", capsule_toy.to_mongo().to_dict()["name"])

        if count > 0:
            capsule_tag.update(linkCount=count)
            print("count:", count)


if __name__ == "__main__":
    # insert_new_product("new_product.json")
    # insert_updated_image("updated_image.json")
    # insert_new_tag("E:/Git/gachatory/batch/tagging/tag-list-translated-edited-20230915.json")
    search_capsule_toy_and_update_tag()
