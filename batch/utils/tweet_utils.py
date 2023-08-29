# twscrape가 지원하는 CLI로 직접 크롤링을 할 때, 일본어가 유니코드로 저장되는 문제를 해결하기 위해 작성한 코드.
# subprocess를 이용해 twscrape의 명령어를 실행하고, 결과를 utf-8로 저장한다.
# 이 과정이 없으면 파일은 utf-16-le, 내용은 utf-8-bom으로 저장되어 데이터 후처리가 어려워진다.
# 일본어 자체는 유니코드로 출력되지만, 파일 자체는 utf-8로 저장되어 데이터 후처리가 용이해진다.
import json
import subprocess

# input example

# commands = [
#     (
#         [
#             "twscrape",
#             "search",
#             "(from:SOTA170317) until:2023-12-31 since:2023-01-01 -filter:replies",
#             "--limit=3000",
#         ],
#         "data-2023.txt",
#     ),
#     # ... add more commands and output file pairs as needed
# ]

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
