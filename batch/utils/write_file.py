import os
import json
from datetime import datetime


def write_file(list, file_name=""):
    print_date_format = datetime.today().strftime("%Y%m%d")

    # file_name에 경로가 포함된 경우 폴더 생성
    if "/" in file_name:
        folder_name = file_name[: file_name.rfind("/")]
        if not os.path.isdir(folder_name):
            os.makedirs(folder_name)

    if file_name == "":
        file_name = print_date_format
    elif file_name.endswith("/"):
        file_name = file_name + print_date_format
    else:
        file_name = file_name + "-" + print_date_format

    fo = open(
        file_name + ".json",
        "w",
        encoding="utf-8",
    )
    fo.write(json.dumps(list, ensure_ascii=False, indent=2))
    fo.close()


def open_json_file_to_list(file_name):
    with open(file_name, "r", encoding="utf-8") as f:
        data = f.read()
        data = json.loads(data)
    return data
