import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()
absolute_path_bandai = os.getenv("ABSOLUTE_PATH_BANDAI")


def brand_path_selector(brand):
    if brand == "bandai":
        return absolute_path_bandai
    else:
        return ""


def log(brand, page, url, status_code, msg="", path=""):
    now = datetime.now()
    nowDate = now.strftime("%Y%m%d")
    nowDatetime = now.strftime("%Y%m%d-%H%M%S")

    # log 폴더가 없을 경우
    if not os.path.isdir(brand_path_selector(brand) + "log"):
        os.makedirs("log")

    f = open(
        brand_path_selector(brand) + "log/" + brand + "_" + nowDate + ".txt",
        "a",
        encoding="utf-8",
    )
    f.write("date:" + nowDatetime + ",")
    f.write("brand:" + brand + ",")
    f.write("page:" + str(page) + ",")
    f.write("status_code:" + str(status_code) + ",")
    f.write("url:'" + url + "'")
    if msg != "":
        f.write(",msg:" + msg + "\n")
    else:
        f.write("\n")
    f.close()
