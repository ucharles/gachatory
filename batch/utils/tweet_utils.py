# twscrape가 지원하는 CLI로 직접 크롤링을 할 때, 일본어가 유니코드로 저장되는 문제를 해결하기 위해 작성한 코드.
# subprocess를 이용해 twscrape의 명령어를 실행하고, 결과를 utf-8로 저장한다.
# 이 과정이 없으면 파일은 utf-16-le, 내용은 utf-8-bom으로 저장되어 데이터 후처리가 어려워진다.
# 일본어 자체는 유니코드로 출력되지만, 파일 자체는 utf-8로 저장되어 데이터 후처리가 용이해진다.
import json
import subprocess
from dotenv import load_dotenv

load_dotenv()
account1_username = os.getenv("ACCOUNT1_USERNAME")
account1_username_pw = os.getenv("ACCOUNT1_USERNAME_PASSWORD")
account1_email = os.getenv("ACCOUNT1_EMAIL")
account1_email_pw = os.getenv("ACCOUNT1_EMAIL_PASSWORD")
account2_username = os.getenv("ACCOUNT2_USERNAME")
account2_username_pw = os.getenv("ACCOUNT2_USERNAME_PASSWORD")
account2_email = os.getenv("ACCOUNT2_EMAIL")
account2_email_pw = os.getenv("ACCOUNT2_EMAIL_PASSWORD")


# input example

commands = [
    (
        [
            "twscrape",
            "search",
            "(from:SOTA170317) until:2024-12-31 since:2024-01-01 -filter:replies",
            "--limit=3000",
        ],
        "data-2024.txt",
    ),
    # ... add more commands and output file pairs as needed
]

# # Reading the file
# file_list = [
#     "updated_data-2017-n.json",
#     "updated_data-2018.json",
#     "updated_data-2019.json",
#     "updated_data-2020.json",
#     "updated_data-2021.json",
#     "updated_data-2022.json",
#     "updated_data-2023.json",
# ]


def execute_and_save(cmd, output_file):
    # Run the command and capture the output
    result = subprocess.run(
        cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True
    )

    # Save the result to a file with utf-8 encoding
    with open(output_file, "w", encoding="utf-8") as file:
        file.write(result.stdout)


def tweet_subprocess(commands):
    # List of commands to be executed

    for cmd, output_file in commands:
        execute_and_save(cmd, output_file)


# twscrape로 크롤링한 결과인 json 파일에서 필요한 정보만 추출하는 코드.


# json에서 필요한 정보 설명
# id: 트윗 id
# date: 트윗 날짜
# url: 트윗 url
# rawContent: 트윗 본문
# photos: 트윗에 포함된 사진 url
# hashtags: 트윗에 포함된 해시태그
def tweet_filter(file_list):
    for file in file_list:
        # To store decoded JSON objects
        filtered_data = []

        with open(file, "r", encoding="utf-8-sig") as f:
            data = json.load(f)

        for doc in data:
            if isinstance(doc, dict):  # Check if each item is a dictionary.
                if doc["media"]["photos"] != []:
                    filtered_doc = {
                        "id": doc["id"],
                        "date": doc["date"],
                        "url": doc["url"],
                        "rawContent": doc["rawContent"],
                        "photos": doc["media"]["photos"],
                        "hashtags": doc["hashtags"],
                    }
                    filtered_data.append(filtered_doc)

        filtered_data = list(reversed(filtered_data))

        # Save the decoded data to a new JSON file using utf-8 encoding
        with open(
            "filtered_" + file.replace("updated_", ""), "w", encoding="utf-8"
        ) as f:
            json.dump(filtered_data, f, ensure_ascii=False, indent=2)


# twscrape를 이용한 크롤링의 결과인 유니코드로 저장된 일본어를 다시 일본어로 변환하는 코드.


def convert_unicode(file_list):
    for file in file_list:
        # To store decoded JSON objects
        decoded_data = []

        with open(file, "r", encoding="utf-8-sig") as f:
            for line in f:
                # Strip whitespace and ignore empty lines
                line = line.strip()
                if line and line != "[" and line != "]" and not line.endswith(","):
                    decoded_data.append(json.loads(line))

        # Save the decoded data to a new JSON file using utf-8 encoding
        with open(
            "updated_" + file.replace(".txt", "") + ".json", "w", encoding="utf-8"
        ) as f:
            json.dump(decoded_data, f, ensure_ascii=False, indent=2)


import asyncio
from twscrape import API, gather
from twscrape.logger import set_log_level


from dataclasses import asdict, is_dataclass
from datetime import datetime
from typing import Any

print_date_format = datetime.today().strftime("%Y%m%d")


def custom_encoder(obj):
    """JSON 변환을 위한 사용자 정의 인코더 함수"""
    if isinstance(obj, datetime):
        return obj.isoformat()
    elif is_dataclass(obj):
        return asdict(obj)
    elif hasattr(obj, "__dict__"):
        return obj.__dict__
    raise TypeError(f"Object of type {obj.__class__.__name__} is not JSON serializable")


def tweet_content_filter(json_file, text=[], username=None):
    """
    트윗을 필터링하는 함수. kwargs에 따라 필터링된 결과를 반환한다.
    :param json: 트윗 데이터
    :param kwargs: 필터링 조건
    :return: 필터링된 트윗 데이터 json
    """
    # 필터링 조건에 따라 트윗을 필터링
    with open(json_file, "r", encoding="utf-8") as file:
        data = json.load(file)

    filtered_data = []

    # text가 빈 배열인 경우 return
    if not text:
        return data

    if username is None:
        return data

    for doc in data:
        # text 배열의 모든 요소가 문장에 포함되어 있는지 확인
        if (
            all(word in doc["rawContent"] for word in text)
            and doc["user"]["username"] == username
        ):
            filtered_data.append(doc)

    return filtered_data


async def get_tweets(user_id, since, until, limit):

    api = API()

    # ADD ACCOUNTS (for CLI usage see BELOW)
    await api.pool.add_account(
        account1_username, account1_username_pw, account1_email, account1_email_pw
    )
    await api.pool.add_account(
        account2_username, account2_username_pw, account2_email, account2_email_pw
    )
    await api.pool.login_all()

    tweets = await gather(
        api.search(
            f"(from:{user_id}) until:{until} since:{since} -filter:replies",
            limit=limit,
        )
    )

    with open(
        f"{user_id}_{print_date_format}_{since}_{until}.json", "w", encoding="utf-8"
    ) as file:
        json.dump(tweets, file, default=custom_encoder, ensure_ascii=False, indent=2)

    pass


def extract_info_from_tweet(file_name):
    try:
        with open(file_name, "r", encoding="utf-8") as file:
            data = json.load(file)
    except Exception as e:
        print(e)

    result = []

    for doc in data:
        result.append(
            {
                "id": doc["id"],
                "username": doc["user"]["username"],
                "date": doc["date"],
                "url": doc["url"],
                "rawContent": doc["rawContent"],
                "photos": [element["url"] for element in doc["media"]["photos"]],
                "hashtags": doc["hashtags"],
            }
        )

    if result:
        with open(
            f"{file_name.replace('.json', '')}_filtered.json", "w", encoding="utf-8"
        ) as file:
            json.dump(result, file, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    # asyncio.run(get_tweets("Jdream_k", "2024-01-01", "2024-12-31", 3000))
    # result = tweet_content_filter(
    #     "E:/Git/gachatory/yell_kaihatsu_20240314_2023-01-01_2023-12-31.json",
    #     text=["━━"],
    #     username="yell_kaihatsu",
    # )

    # with open(
    #     "yell_kaihatsu_20240314_filtered_2023.json", "w", encoding="utf-8"
    # ) as file:
    #     json.dump(result, file, ensure_ascii=False, indent=2)

    extract_info_from_tweet("Jdream_k_20240314_2024-01-01_2024-12-31.json")
    pass
