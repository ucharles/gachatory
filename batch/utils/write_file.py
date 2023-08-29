import os
import json
from datetime import datetime


def write_file(list, file_name=""):
    # file_name에 경로가 포함된 경우 폴더 생성
    if "/" in file_name:
        folder_name = file_name[: file_name.rfind("/")]
        if not os.path.isdir(folder_name):
            os.makedirs(folder_name)

    if file_name == "":
        file_name = datetime.today().strftime("%Y%m%d")
    elif file_name.endswith("/"):
        file_name = file_name + datetime.today().strftime("%Y%m%d")
    else:
        file_name = file_name + "-" + datetime.today().strftime("%Y%m%d")

    fo = open(
        file_name + ".json",
        "w",
        encoding="utf-8",
    )
    fo.write(json.dumps(list, ensure_ascii=False))
    fo.close()
