import os
import sys
import re
import deepl
import json
from dotenv import load_dotenv

sys.path.append(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))

from utils.write_file import write_file


# dotenv
load_dotenv()

deepl_auth_key = os.getenv("DEEPL_AUTH_KEY")


# txt 파일을 읽어옴 (일본어)
# 줄 단위로 읽어서 줄바꿈 문자 삭제 후 리스트에 저장
def read_txt_line_to_list(file_name):
    with open(file_name, "r", encoding="utf-8") as f:
        lines = f.readlines()

    for i in range(len(lines)):
        lines[i] = lines[i].replace("\n", "")
        # 쉼표로 구분된 단어들을 리스트로 변환
        if "," in lines[i]:
            lines[i] = re.split(r",\s*", lines[i])

    return lines


# 리스트 내용을 바탕으로 json 파일 작성
# ja, ko, en 순서로 작성
def tag_list_to_json(tag_list):
    json_list = []

    for tag in tag_list:
        json_list.append(
            {
                "ja": tag,
                "ko": [],
                "en": [],
            }
        )

    return json_list


# DeepL API를 사용하여 list 내용을 번역
# def translate_list(list):


def translate_json_list(json_list):
    translator = deepl.Translator(deepl_auth_key)

    for json in json_list:
        for i, ja in enumerate(json["ja"]):
            result_ko = translator.translate_text(ja, target_lang="KO")
            result_en = translator.translate_text(ja, target_lang="EN-US")
            json["ja"][i] = ja
            json["ko"][i] = result_ko.text
            json["en"][i] = result_en.text

    return json_list


def json_string_to_list(file_name):
    with open(file_name, "r", encoding="utf-8") as f:
        json_string = f.read()

    json_list = json.loads(json_string)

    for item in json_list:
        if type(item["ja"]) == str:
            item["ja"] = [item["ja"]]
        if type(item["ko"]) == str:
            item["ko"] = [item["ko"]]
        if type(item["en"]) == str:
            item["en"] = [item["en"]]

    return json_list


if __name__ == "__main__":
    # json_list = []

    # tag_list = read_txt_line_to_list("tag_list.txt")
    # json_list = tag_list_to_json(tag_list)
    # write_file(json_list, "json_list_tag")
    # json_list = translate_json_list(json_list)
    # write_file(json_list, "tag_list_translated")
