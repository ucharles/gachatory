import unicodedata
import re
import os
from datetime import datetime, timedelta, timezone
from typing import List
import math


def convert_to_numeric_month(month: str) -> int:
    """
    Convert a month string to a numeric month.

    Args:
        month (str): The month string to convert.

    Returns:
        int: The numeric month.
    """
    mapping = {
        "1月": 1,
        "2月": 2,
        "3月": 3,
        "4月": 4,
        "5月": 5,
        "6月": 6,
        "7月": 7,
        "8月": 8,
        "9月": 9,
        "01": 1,
        "02": 2,
        "03": 3,
        "04": 4,
        "05": 5,
        "06": 6,
        "07": 7,
        "08": 8,
        "09": 9,
        "10": 10,
        "11": 11,
        "12": 12,
    }
    return mapping[month]


def calculate_last_day(year: int, month: int) -> int:
    """
    Calculate the last day of the month.

    Args:
        year (int): The year to calculate.
        month (int): The month to calculate.

    Returns:
        int: The last day of the month.
    """
    if month == 12:
        year += 1
        month = 1
    last_day = (datetime(year, month + 1, 1) - timedelta(days=1)).day
    return last_day


def date_convert_to_iso(
    dates: str, timezone_obj: timezone = timezone(timedelta(hours=9))
):
    """
    Convert a date string to ISO format.

    Args:
        dates (str): The date string to convert.

    Returns:
        str: The date string in ISO format.
    """
    try:
        date_str = dates.strip()
        year = int(date_str[:4])
        month = convert_to_numeric_month(date_str[5:7])

        mapping = {"上旬": "01", "中旬": "15", "下旬": "last_day", "未定": "last_day"}

        # 상순, 중순, 하순, 미정인 경우
        if date_str[-2:] in mapping:
            # 하순, 미정인 경우
            if mapping[date_str[-2:]] == "last_day":
                parsed_date = datetime(year, month, calculate_last_day(year, month))
            else:
                parsed_date = datetime(year, month, int(mapping[date_str[-2:]]))
        else:
            if date_str[-1] == "日":
                parsed_date = datetime(year, month, int(date_str[-3:-1]))
            else:
                parsed_date = datetime(year, month, calculate_last_day(year, month))

        # Apply the timezone to the parsed_date
        parsed_date = parsed_date.replace(tzinfo=timezone_obj)

        return parsed_date.isoformat()
    except Exception as e:
        print('"' + date_str + '"', e)
        return None


def extract_price_from_string(price: str | int) -> int:
    """
    Find patterns of price and remove the non-numeric characters.
    """

    if type(price) == int:
        return price

    # Find the price pattern
    pattern = re.compile(r"([\d,]+)円")
    match = pattern.search(price)

    # If the pattern is found, return the price
    if match:
        return int(match.group(1).replace("円", "").replace(",", ""))
    else:
        return None


def format_month(text):
    # 1자리 월을 찾기 위한 정규식 패턴 (캡쳐 그룹 사용)
    pattern = r"(\d{4}年)(\d{1})月"

    # 1자리 월을 2자리로 변경
    result = re.sub(pattern, lambda m: f"{m.group(1)}0{m.group(2)}月", text.strip())

    return result


def brand_to_path(brand):
    switcher = {
        "Takara Tomy Arts": "images/takaratomy/",
        "BANDAI": "images/bandai/",
        "KITAN CLUB": "images/kitan/",
    }

    # 디폴트 이미지 저장 경로 설정 (images 폴더)
    return switcher.get(brand, "images/unknown/")


class CapsuleToyCl:
    allowed_keys = {
        "name": None,
        "date": None,
        "price": 0,
        "detail_url": None,
        "description": None,
        "header": None,
        "detail_img": None,
        "img": None,
    }

    def __init__(self, **kwargs):
        # 모든 허용된 키에 대해 초기화 진행
        for key in self.allowed_keys:
            # 키에 대응하는 메서드가 있으면 호출, 없으면 기본값 또는 None 할당
            method = f"set_{key}"
            if key in kwargs:
                value = kwargs[key]
                if hasattr(self, method):
                    getattr(self, method)(value)
                else:
                    setattr(self, key, value)
            else:
                setattr(self, key, self.allowed_keys[key])

        if kwargs.get("date"):
            if type(kwargs["date"]) == list:
                self.set_dateISO()
            elif re.search(r"\d{4}年\d{1,2}月", kwargs["date"]):
                self.set_dateISO()
            else:
                self.date = None
                self.dateISO = None
        else:
            self.date = None
            self.dateISO = None

        self.createdAt = datetime.utcnow().isoformat()
        self.brand = None

        if "detail_img" not in kwargs:
            self.detail_img = []

    def set_name(self, name):
        self.name = unicodedata.normalize(
            "NFKC", name.replace("\r\n", "").replace("🄫", "©").strip()
        )

    def set_date(self, date):
        if isinstance(date, list):
            self.date = date
        else:
            self.date = format_month(date)

    def set_price(self, price):
        self.price = extract_price_from_string(price)

    def set_description(self, description):
        _description = (
            description.replace("Ⓒ", "©").replace("🄫", "©").replace("\r\n", "").strip()
        )
        _description = re.sub(r"\s+", " ", _description)

        # # 전각 문자 앞의 반각 공백 제거
        # pattern_before = re.compile(r"(\s+)([^\x01-\x7E])")
        # _description = pattern_before.sub(r"\2", _description)
        # # 전각 문자 뒤의 반각 공백 제거
        # pattern_after = re.compile(r"([^\x01-\x7E])(\s+)")
        # _description = pattern_after.sub(r"\1", _description)

        self.description = unicodedata.normalize("NFKC", _description)

    def set_dateISO(self):
        if isinstance(self.date, list):
            self.dateISO = [date_convert_to_iso(date) for date in self.date]
        else:
            self.dateISO = date_convert_to_iso(self.date)

    def set_store_img(self, img):
        self.img = brand_to_path(self.brand) + os.path.basename(img)

    def set_store_detail_img(self, detail_img):
        new_detail_img = []
        for img in detail_img:
            new_detail_img.append(brand_to_path(self.brand) + os.path.basename(img))
        self.detail_img = new_detail_img

    def get_json(self):
        return {
            "brand": self.brand,
            "name": self.name,
            "date": self.date,
            "price": self.price,
            "img": self.img,
            "detail_img": self.detail_img,
            "detail_url": self.detail_url,
            "header": self.header,
            "description": self.description,
            "dateISO": self.dateISO,
            "lng": self.lng,
        }


class TakaraTomyCapsuleToyCl(CapsuleToyCl):
    DOMAIN = "https://www.takaratomy-arts.co.jp"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.brand = "Takara Tomy Arts"
        self.lng = "ja"

    def set_date(self, date):
        self.date = format_month(date).replace("発売時期:", "")

    def set_detail_url(self, detail_url):
        if self.DOMAIN not in detail_url:
            self.detail_url = self.DOMAIN + detail_url
        else:
            self.detail_url = detail_url

    def set_detail_img(self, detail_img):
        # detail_img가 리스트가 아니면 리스트로 변환
        if not isinstance(detail_img, list):
            detail_img = [detail_img]
        # 상세 이미지 URL에 도메인을 붙여서 저장
        self.detail_img = [
            self.DOMAIN + img if self.DOMAIN not in img else img for img in detail_img
        ]


class KitanClubCapsuleToyCl(CapsuleToyCl):
    DOMAIN = "https://kitan.jp"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.brand = "KITAN CLUB"
        self.lng = "ja"

    def set_dateISO(self):
        if self.date:
            self.dateISO = date_convert_to_iso(self.date)
        else:
            self.dateISO = None

    def set_detail_img(self, detail_img):
        # detail_img가 리스트가 아니면 리스트로 변환
        if not isinstance(detail_img, list):
            detail_img = [detail_img]
        # 상세 이미지 URL에 도메인을 붙여서 저장
        self.detail_img = detail_img

    def set_description(self, description):
        _description = re.sub(
            r"\s+", " ", description.replace("\n", "").replace("🄫", "©").strip()
        )

        # 전각 문자 앞의 반각 공백 제거
        pattern_before = re.compile(r"(\s+)([^\x01-\x7E])")
        _description = pattern_before.sub(r"\2", _description)
        # 전각 문자 뒤의 반각 공백 제거
        pattern_after = re.compile(r"([^\x01-\x7E])(\s+)")
        _description = pattern_after.sub(r"\1", _description)

        self.description = unicodedata.normalize("NFKC", _description)


class BushiroadCapsuleToyCl(CapsuleToyCl):
    DOMAIN = "https://bushiroad-creative.com"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.brand = "BUSHIROAD CREATIVE"
        self.lng = "ja"

    def set_price(self, price):
        _price = extract_price_from_string(price)
        _price = int(_price)
        _price = math.ceil(_price / 100.0) * 100

        self.price = _price

    def set_date(self, date):
        self.date = format_month(date).replace("発売予定", "")

    def set_detail_url(self, detail_url):
        if self.DOMAIN not in detail_url:
            self.detail_url = self.DOMAIN + detail_url
        else:
            self.detail_url = detail_url


class KorokoroCapsuleToyCl(CapsuleToyCl):

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.brand = "KOROKORO"
        self.lng = "ja"

    def set_name(self, name):
        self.name = unicodedata.normalize(
            "NFKC", name.replace("\n", "").replace("\t", "").strip()
        )


class TarlinCapsuleToyCl(CapsuleToyCl):

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.brand = "tarlin (EPOCH)"
        self.lng = "ja"

    def set_name(self, name):
        self.name = unicodedata.normalize(
            "NFKC", name.replace("\n", "").replace("\t", "").strip()
        )


class SotaCapsuleToyCl(CapsuleToyCl):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.brand = "SO-TA"
        self.lng = "ja"

    def set_name(self, name):
        self.name = unicodedata.normalize(
            "NFKC", name.replace("\n", "").replace("\t", "").strip()
        )


class BandaiCapsuleToyCl(CapsuleToyCl):
    def __init__(self, _id=None, resale=None, **kwargs):
        super().__init__(**kwargs)
        self.brand = "BANDAI"
        self.lng = "ja"
        self.resale = True if resale else False
        self._id = _id

    def set_name(self, name):
        self.name = unicodedata.normalize(
            "NFKC", name.replace("\n", "").replace("\t", "").strip()
        )

    def set_detail_url(self, detail_url):
        if "../products/detail.php?jan_code=" in detail_url:
            self.detail_url = detail_url.replace(
                "../products/detail.php?jan_code=",
                "https://www.bandai.co.jp/catalog/item.php?jan_cd=",
            )
        else:
            self.detail_url = detail_url

    def get_json(self):
        return {
            "_id": self._id,
            "brand": self.brand,
            "name": self.name,
            "date": self.date,
            "price": self.price,
            "img": self.img,
            "detail_img": self.detail_img,
            "detail_url": self.detail_url,
            "header": self.header,
            "description": self.description,
            "dateISO": self.dateISO,
            "lng": self.lng,
            "resale": self.resale,
        }
