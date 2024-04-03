import re
import json
import os
import sys

from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone
from bson import ObjectId

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

import logging

# 로깅 기본 설정: 로그 레벨, 로그 포맷 및 날짜 포맷 지정
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

from utils.write_file import write_file
from utils.date_convert_to_ISO import format_month
from utils.num_formatter import extract_price_from_string
from scraping.capsule_toy_classes import CapsuleToyCl, TarlinCapsuleToyCl
from utils.image_utils import get_capsule_toy_images
from utils.crud_mongodb import filter_exist_db, insert_new_product_as_bulk


# models
from models.capsule_toy import (
    CapsuleToy,
    CapsuleTag,
    SubscriptionTag,
    Notification,
    Localization,
)

# dotenv
load_dotenv()

database_url = os.getenv("DATABASE_URL")
database_name = os.getenv("DATABASE_NAME")
image_download_folder = os.getenv("IMAGE_SERVER_PATH")


# 특정 태그에 알림설정을 한 경우, 신상이 등록되었을 때 notification 컬렉션에 데이터를 등록함

# 배치는 1일 1회 실행되며, 1일 1회 실행되는 시간은 오전 0시
# DB에는 ISODate로 저장되며, 전날 15시 정도에 데이터가 등록됨 (0시 - 9시간 = 전날 15시)
# 전날 15시 이후에 등록되거나 수정된 데이터를 찾아서 알림을 보내야 함


# 1. 유저가 구독한 태그 목록들 불러오기 (state: true)
#    유저 수가 크지 않기에 한번에 불러와도 무리가 없음
# 2. 새로 등록된 상품 불러오기
#    한번에 등록되는 새 상품도 많지 않아 한꺼번에 불러온다

# 계산을 최소화 하려면 어떻게 해야 하는가?

# tag_capsule_dict = {}


def connect_to_db():
    try:
        connect(database_name, host=database_url)
        logging.info("DB Connection Success")
    except Exception as e:
        logging.error(f"DB Connection Error: {e}")
        raise


def get_15_utc_datetime():
    # datetime.utcnow() 사용 금지
    now = datetime.now(timezone.utc)

    # 현재 hour가 15보다 작으면 전날로 설정
    if now.hour < 15:
        now = now - timedelta(days=1)

    # 15시로 설정
    now = now.replace(hour=15, minute=0, second=0, microsecond=0)

    return now


def get_current_month_datetime():
    now = datetime.now(timezone(timedelta(hours=9)))

    now = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    return now


def generate_notification(batch_days=1):
    # connect to db
    connect_to_db()

    # 1. 유저가 구독한 태그 목록들 불러오기 (state: true)
    subscription_tag = SubscriptionTag.objects.filter(state=True)

    logging.info(f"subscription_tag: {len(subscription_tag)}")

    # 2. 새로 등록된 상품 불러오기
    # populate는 어떻게 하나
    capsule_toy = CapsuleToy.objects(
        Q(releaseUpdateDate__gte=get_15_utc_datetime())
        | Q(dateISO__gte=get_current_month_datetime())
    )

    logging.info(f"capsule_toy: {len(capsule_toy)}")

    # 태그별로 상품을 묶어서 딕셔너리에 저장
    tag_capsule_dict = {}

    for capsule in capsule_toy:
        logging.info(f"capsule: {capsule.name}")
        localizations = Localization.objects(capsuleId=capsule.id)

        # 언어별로 브랜드와 캡슐 이름을 저장
        brand_name = {}
        capsule_name = {}

        brand_name["ja"] = capsule.brand
        capsule_name["ja"] = capsule.name

        # localization에서 ko, en만 저장
        for loc in localizations:
            if loc.lng == "ko":
                brand_name["ko"] = loc.brand
                capsule_name["ko"] = loc.name
            elif loc.lng == "en":
                brand_name["en"] = loc.brand
                capsule_name["en"] = loc.name

        new_capsule = capsule  # capsule 복사본

        # capsule 복사본에 브랜드와 캡슐 이름 저장
        new_capsule.brand = brand_name
        new_capsule.name = capsule_name

        for tag in capsule.tagId:

            logging.info(f"new_capsule: {new_capsule.name['ko']}")

            if tag.id in tag_capsule_dict:
                tag_capsule_dict[tag.id].append(new_capsule)
            else:
                tag_capsule_dict[tag.id] = [new_capsule]

    logging.info(f"tag_capsule_dict: {tag_capsule_dict}")

    # 유저별로 태그를 묶어서 딕셔너리에 저장
    user_tag_capsule_dict = {}

    for sub in subscription_tag:
        logging.info(f"sub tagId: {sub.tagId.to_mongo().to_dict()}")
        if sub.userId in user_tag_capsule_dict:
            user_tag_capsule_dict[sub.userId].append(sub)
        else:
            user_tag_capsule_dict[sub.userId] = [sub]

    logging.info(f"user_tag_capsule_dict: {user_tag_capsule_dict}")

    # user_tag_capsule_dict를 순회하며 알림 데이터 생성

    bulk_notification = []

    for user, tags in user_tag_capsule_dict.items():
        logging.info(f"user: {user}")
        logging.info(f"tags: {tags}")

        notification_id = ObjectId()  # 알림 데이터 ID 생성

        # 알림 데이터 생성
        for tag in tags:
            logging.info(f"tag: {tag.to_mongo().to_dict()}")

            tag_name = {}
            tag_dict = tag.tagId.to_mongo().to_dict()
            logging.info(f"tag_dict: {tag_dict}")
            tag_name["ja"] = tag_dict["ja"]
            tag_name["ko"] = tag_dict["ko"]
            tag_name["en"] = tag_dict["en"]

            if tag_dict["_id"] in tag_capsule_dict:
                logging.info(f"tag in tag_capsule_dict")

                for capsule in tag_capsule_dict[tag_dict["_id"]]:
                    logging.info(f"tag: {tag_name['ko']}")
                    logging.info(f"capsule: {capsule.name['ko']}")
                    new_notification = Notification(
                        userId=user,
                        capsuleId=capsule.id,
                        tagId=tag_dict["_id"],
                        notificationId=notification_id,
                        capsule_name=capsule.name,
                        tag_name=tag_name,
                        brand_name=capsule.brand,
                        release_date=capsule.date[0],
                        detail_url=capsule.detail_url,
                        img=(
                            capsule.img
                            if capsule.img != ""
                            else (
                                capsule.detail_img[0]
                                if capsule.detail_img != []
                                else ""
                            )
                        ),
                    )
                    bulk_notification.append(new_notification)

    logging.info(f"bulk_notification: {bulk_notification}")

    if bulk_notification != []:
        Notification.objects.insert(bulk_notification)

    pass


if __name__ == "__main__":
    generate_notification(batch_days=1)
