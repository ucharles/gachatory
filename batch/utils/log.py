import os
from datetime import datetime


def log(maker, page, url, status_code, msg=""):
    now = datetime.now()
    nowDate = now.strftime("%Y%m%d")
    nowDatetime = now.strftime("%Y%m%d-%H%M%S")

    # log 폴더가 없을 경우
    if not os.path.isdir("log"):
        os.makedirs("log")

    f = open("log/" + maker + "_" + nowDate + ".txt", "a", encoding="utf-8")
    f.write("date:" + nowDatetime + ",")
    f.write("maker:" + maker + ",")
    f.write("page:" + str(page) + ",")
    f.write("status_code:" + str(status_code) + ",")
    f.write("url:'" + url + "'")
    if msg != "":
        f.write(",msg:" + msg + "\n")
    else:
        f.write("\n")
    f.close()
