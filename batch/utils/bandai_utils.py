import re


def bandai_first_image_check(img_list):
    # 확장자를 제외한 파일명만 추출
    result_img = ""

    for img in img_list:
        img_name = img.split("/")[-1]
        img_name = re.sub("[^0-9a-zA-Z\._]", "", img_name)
        img_name = img_name.split(".")[0]

        # 이미지 파일명이 _1로 끝나면 True
        if img_name.endswith("_1"):
            result_img = img
            break

    return result_img
