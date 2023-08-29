import os, sys
import json
import unicodedata


# dictinary의 element를 다른 type으로 변환하는 함수
# date: string -> array
# name, description: 일본어 전각 특수문자는 반각으로 변환, 반각 가타카나는 전각 가타카나로 변환


def convert_dic():
    # ファイルのパスを取得
    product_list = []

    with open("capsule-toy-backup.json", "r", encoding="utf-8") as file:
        for line in file:
            product_list.append(json.loads(line))

        for product in product_list:
            date = [product["date"]]
            product["date"] = date

            name = unicodedata.normalize("NFKC", product["name"])
            product["name"] = name

            description = unicodedata.normalize("NFKC", product["description"])
            product["description"] = description

    with open("capsule-toy-backup-converted.json", "w", encoding="utf-8") as file:
        json.dump(product_list, file, indent=4, ensure_ascii=False)
