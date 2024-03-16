import openai
import os
import sys
import re
from bson import ObjectId
import json
from dotenv import load_dotenv
from datetime import datetime

from mongoengine import (
    connect,
    disconnect,
    DynamicDocument,
    StringField,
    IntField,
    ListField,
    DateTimeField,
)
from mongoengine.queryset.visitor import Q

sys.path.append(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))


from models.capsule_toy import CapsuleToy, CapsuleTag
from utils.write_file import write_file
from utils.random_chars import generate_random_string


# 1. MongoDB에서 일본어 태그를 가져온 뒤, Set에 저장
# 2. MongoDB에서 태그가 없는 최근 데이터를 호출 (3월 한달?)
# 3. 반복문을 순회하며 ChatGPT를 이용해 태깅, 카테고리 분류
# 4. 태깅한 데이터를 JSON 형태로 파일에 저장
# { "id": "123", "title": "상품명", "description", "설명", "tags": [{"tag": "태그", "category": "카테고리"}, ...] }
# 5. JSON 형태로 저장된 태깅한 데이터를 수동 확인
# 6. 수동 확인한 데이터를 MongoDB에 저장하면서, DB의 캡슐 토이 데이터에 플래그를 추가하여 수동 확인한 데이터인지 표시

# dotenv
load_dotenv()

database_url = os.getenv("DATABASE_URL")
database_name = os.getenv("DATABASE_NAME")

absolute_tagging_path = os.path.dirname(os.path.abspath(__file__)).replace("\\", "/")


# 1. MongoDB에서 일본어 태그를 가져온 뒤, Set에 저장하는 함수
def get_ja_tags():

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
        sys.exit(1)

    # 태그를 저장할 Set
    ja_tags = set()

    # tag 전체 목록을 가져와 Set에 저장
    try:
        for tag in CapsuleTag.objects():
            # spread operator
            for ja in tag.ja:
                ja_tags.add(ja)
            # tag_info = tag.to_mongo().to_dict()
            # print(tag_info)
    except Exception as e:
        print(f"DB Query Error: {e}")
        sys.exit(1)

    return ja_tags


def get_no_tag_data(count, start_date, end_date):
    # params
    # count: 가져올 데이터 개수
    # start_date: 시작 날짜
    # end_date: 끝 날짜

    # default 값 설정
    _count = count
    _start_date = start_date
    _end_date = end_date

    if _count is None:
        _count = 10

    if _start_date is None:
        _start_date = datetime.now()

    # end_date가 None이면 지금부터 한달 뒤로 설정
    if _end_date is None:
        _end_date = datetime.now() + timedelta(days=30)

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
        sys.exit(1)

    # 태그가 없는 데이터를 저장할 List
    no_tag_data = []

    # 태그가 없는 데이터를 가져와 List에 저장
    try:
        # tagId가 없거나 비어있는 데이터를 가져옴, 최대 _count개
        for capsule in (
            CapsuleToy.objects((Q(gpt_tagged__exists=False) | Q(gpt_tagged=False)))
            .order_by("-_id")
            .limit(_count)
        ):
            capsule_info = capsule.to_mongo().to_dict()
            no_tag_data.append(capsule_info)
    except Exception as e:
        print(f"DB Query Error: {e}")
        sys.exit(1)

    # DB 연결 종료
    try:
        disconnect(alias="default")
        print("DB Connection Close Success")
    except Exception as e:
        print(f"DB Connection Close Error: {e}")
        sys.exit(1)

    return no_tag_data


def tagging_with_gpt(name, description):
    # params
    # title: 캡슐의 제목
    # description: 캡슐의 설명

    _name = name
    _description = description

    if _name == None or _description == None or _name == "" or _description == "":
        return None

    # ChatGPT API Key
    openai.api_key = os.getenv("OPENAI_API_KEY")

    system_message = {
        "role": "system",
        "content": """
        Extract keywords from the name and description of the capsule toy. 
        Write your results according to the constraints. Also, define the property according to the rules.

        Constraints:
        - Be careful not to include investigations like the Japanese の、が、に in your keywords.
        - Do not extract keywords that indicate the number of capsule toys. ex) "全2種". 
        - If the array length of the keywords is 2 or more, create a new object and insert the keywords one by one.
        - "property" can be duplicated in Array of JSON object.
        - Do not extract the keyword "シリーズ".

        Property Rules:
        - title: title of the anime, game, movie. If number is included, exclude it from the text.
        - character: the name of a specific character.
        - brand: a set larger than the artwork. Think of it more like a company. Marvel, Tomica, Pixar, Sanrio, Precure, etc.
        - series: Given to capsule toys that are released in a series (フラットガシャポン, ジャンボシールダス, etc.)
        - author: If the author's name is listed in the name or description, or if there are many characters. Kanahei, Nagano, etc.
        - category: The form of the capsule toy. Acrylic, rubber mascot, clear file, poster, etc.
        - element: pronouns such as sweets, cats, sharks, etc.

        Desired format: 
        [{"ja": ["keyword1"], "ko": ["translated_keyword1_ko"], "en": ["translated_keyword1_en"], "property": "title"}, {"ja": ["keyword2"], "ko": ["translated_keyword2_ko"],  "en": ["translated_keyword2_en"], "property": "character"}, {"ja": ["keyword3"], "ko": ["translated_keyword3_ko"], "en": ["translated_keyword3_en"], "property": "author"}]

        Result Example:
        [{"ja": ["SDガンダムフルカラーステージ"], "ko": ["SD건담 풀 컬러 스테이지"], "en": ["SD Gundam Full Color Stage"], "property": "title"}, {"ja": ["ウィングガンダム"], "ko": ["윙 건담"], "en": ["Wing Gundam"], "property": "character"}, {"ja": ["SDガンダム"], "ko": ["SD건담"], "en": ["SD Gundam"], "property": "series"}]

        DO NOT THIS:
        { "ja": ["孫悟空", "ベジータ", "ピッコロ", "フリーザ"], "ko": ["손오공", "베지터", "피콜로", "프리자"], "en": ["Son Goku", "Vegeta", "Piccolo", "Frieza"], "property": "character" }
        DO THIS INSTEAD:
        { "ja": ["孫悟空"], "ko": ["손오공"], "en": ["Son Goku"], "property": "character" }, { "ja": ["ベジータ"], "ko": ["베지터"], "en": ["Vegeta"], "property": "character" }, { "ja": ["ピッコロ"], "ko": ["피콜로"], "en": ["Piccolo"], "property": "character" }, { "ja": ["フリーザ"], "ko": ["프리자"], "en": ["Frieza"], "property": "character" }
        """,
    }

    user_message = {
        "role": "user",
        "content": f"'name': '{_name}', 'description': '{_description}'",
    }

    # ChatGPT를 이용해 태깅
    response = openai.chat.completions.create(
        model="gpt-3.5-turbo-0125",
        messages=[system_message, user_message],
        max_tokens=500,
    )

    # 태그를 저장할 List
    result = ""

    try:
        # 태깅 결과를 JSON 형태로 변환
        for choice in response.choices:
            # 태그와 카테고리를 JSON 형태로 저장
            result = json.loads(choice.message.content)
    except Exception as e:
        print(f"ChatGPT Error: {e}")
        print("name: ", _name, "description: ", _description)
        print("contents: ", choice.message.content)
        return None

    # 태깅 결과를 JSON 형태로 반환
    return result


def flag_capsule_toy(id):

    if id == None or id == "":
        return False

    _id = str(id)

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
        return False

    # 태그가 없는 데이터를 가져와 List에 저장
    try:
        # tagId가 없거나 비어있는 데이터를 가져옴, 최대 _count개
        capsule = CapsuleToy.objects(id=ObjectId(id)).first()
        capsule.gpt_tagged = True
        capsule.save()
        print(f"Flagged CapsuleToy: {id}")
    except Exception as e:
        print(f"DB Query Error: {e}")
        return False

    return True


if __name__ == "__main__":

    capsule_count = 10
    date_string = datetime.today().strftime("%H%M%S")

    ja_tags = get_ja_tags()
    # print(ja_tags)
    # print(len(ja_tags))
    no_tag_data = get_no_tag_data(
        capsule_count, datetime(2021, 3, 1), datetime(2021, 3, 31)
    )
    # print("no_tag_data", no_tag_data)

    results = []
    for capsule in no_tag_data:
        tags = tagging_with_gpt(capsule["name"], capsule["description"])

        filtered_tags = []

        for tag in tags:
            if tag["ja"][0] in ja_tags:
                print("Already exists in the database", tag["ja"][0])
                continue
            else:
                filtered_tags.append(tag)

        results.append(
            {
                "id": str(capsule["_id"]),
                "title": capsule["name"],
                "description": capsule["description"],
                "tags": filtered_tags,
            }
        )
        write_file(results, absolute_tagging_path + "/tagging_result-" + date_string)

    write_file(results, absolute_tagging_path + "/tagging_result-" + date_string)
    print(tags)

    # write_file(results, absolute_tagging_path + "/tagging_result-" + ran_str)

    # tags = tagging_with_gpt(
    #     "SDガンダムフルカラーステージ19",
    #     "大人気のSDガンダムフルカラーがついに100体を突破したぞっ!それを記念して、粉気からウィングガンダムシリーズが登場した全6種。ますます広がるSDガンダムワールドに乞うご期待!",
    # )
    # print(test)

    pass
