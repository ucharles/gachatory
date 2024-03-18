import os
import sys
import logging
from bson import ObjectId
from datetime import datetime


# 로깅 기본 설정: 로그 레벨, 로그 포맷 및 날짜 포맷 지정
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
# 한 계층 위로 올라가서 부모 디렉토리를 import하기 위한 설정
sys.path.append(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))

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


# models
from models.capsule_toy import CapsuleToy, CapsuleTag, Localization


from dotenv import load_dotenv

load_dotenv()
deepl_key = os.getenv("DEEPL_AUTH_KEY")
database_url = os.getenv("DATABASE_URL")
database_name = os.getenv("DATABASE_NAME")


import deepl

translator = deepl.Translator(deepl_key)


def translate_brand(brand, target_lang):
    if target_lang == "ko":
        if "BANDAI" in brand:
            return "반다이"
        elif "Takara Tomy Arts" in brand:
            return "타카라토미"
        elif "KOROKORO" in brand:
            return "코로코로"
        elif "BUSHIROAD CREATIVE" in brand:
            return "부시로드"
        elif "tarlin" in brand:
            return "탈린 (에포크)"
        else:
            return brand
    elif target_lang == "en":
        if "BANDAI" in brand:
            return "Bandai"
        elif "Takara Tomy Arts" in brand:
            return "Takara Tomy Arts"
        elif "KOROKORO" in brand:
            return "Korokoro"
        elif "BUSHIROAD CREATIVE" in brand:
            return "Bushiroad Creative"
        elif "tarlin" in brand:
            return "tarlin (EPOCH)"
        else:
            return brand
    else:
        return brand


def translate_capsule_toy():
    translator = deepl.Translator(deepl_key)

    # connect to db
    try:
        connect(database_name, host=database_url)
        logging.info("DB Connection Success")
    except Exception as e:
        logging.error(f"DB Connection Error: {e}")
        return

    # 올해 년도 계산
    now = datetime.now()
    year = now.year

    # DB에서 캡슐 토이 정보 불러오기
    # 1. capsule-toy 컬렉션을 조회, localization 필드가 없거나 비어있는 데이터를 조회
    capsule_toys = CapsuleToy.objects(
        (Q(localization=None) | Q(localization=[]))
        & (Q(date__contains="2020") & Q(name__not__icontains="【箱売】"))
    )

    if not capsule_toys:
        logging.info("No data to translate")
        return

    # 번역할 데이터를 배열에 담기
    new_localization = []
    # capsule-toy 컬렉션을 업데이트할 데이터를 배열에 담기
    capsule_bulk_update = []

    logging.info(f"Total {len(capsule_toys)} data to translate")

    for capsule_toy in capsule_toys:
        usage = translator.get_usage()

        if usage.any_limit_reached:
            logging.error("Usage limit exceeded")
            break
        if usage.character.valid:
            logging.info(
                f"Character usage: {usage.character.count} of {usage.character.limit}"
            )
        if usage.document.valid:
            logging.info(
                f"Document usage: {usage.document.count} of {usage.document.limit}"
            )

        # name, header, description
        name = capsule_toy.name if capsule_toy.name != None else ""
        description = capsule_toy.description if capsule_toy.description != None else ""
        header = capsule_toy.header if capsule_toy.header != None else ""

        text_list = [name, description, header]

        logging.info(f"Translating {text_list}")

        # 번역할 데이터가 없으면 다음 데이터로 넘어가기
        if not any(text_list):
            continue

        # 번역할 데이터를 deepL API에 전달하기
        ko_result = translator.translate_text(
            text_list, target_lang="KO", source_lang="JA"
        )
        en_result = translator.translate_text(
            text_list, target_lang="EN-US", source_lang="JA"
        )

        new_kor = Localization(
            id=ObjectId(),
            lng="ko",
            capsuleId=capsule_toy.id,
            brand=translate_brand(capsule_toy.brand, "ko"),
            name=ko_result[0].text,
            header=ko_result[2].text,
            description=ko_result[1].text,
        )
        new_eng = Localization(
            id=ObjectId(),
            lng="en",
            capsuleId=capsule_toy.id,
            brand=translate_brand(capsule_toy.brand, "en"),
            name=en_result[0].text,
            header=en_result[2].text,
            description=en_result[1].text,
        )

        new_localization.append(new_kor)
        new_localization.append(new_eng)
        capsule_bulk_update.append(
            UpdateOne(
                {"_id": capsule_toy.id},
                {
                    "$set": {
                        "localization": [new_kor.id, new_eng.capsuleId],
                    }
                },
            )
        )

        logging.info(
            f"KO / Brand: {new_kor.brand}, Name: {new_kor.name}, Description: {new_kor.description}, Header: {new_kor.header}"
        )
        logging.info(
            f"EN / Brand: {new_eng.brand}, Name: {new_eng.name}, Description: {new_eng.description}, Header: {new_eng.header}"
        )

    # 번역된 정보를 DB에 저장하기
    try:
        if new_localization:
            Localization.objects.insert(new_localization)
            CapsuleToy._get_collection().bulk_write(capsule_bulk_update, ordered=False)
            logging.info(f"New Localization inserted: {len(new_localization)}")
    except Exception as e:
        logging.error(f"DB Insert Error: {e}")
        return

    logging.info("Translation Complete")


# deepL API를 이용하여 번역

# DB에서 캡슐 토이 정보 불러오기
# 1. capsule-toy 컬렉션을 조회, localization 필드가 없거나 비어있는 데이터를 조회

# 번역할 캡슐 토이 정보를 deepL API에 전달하기
# 번역된 정보를 DB에 저장하기

if __name__ == "__main__":
    translate_capsule_toy()
