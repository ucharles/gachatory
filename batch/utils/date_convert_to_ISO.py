from typing import List
from datetime import datetime


def date_convert_to_iso(dates: str):
    date_str = dates.strip()
    if "上旬" in date_str:
        parsed_date = datetime.strptime(
            f"{date_str[:4]}-{date_str[5:7]}-01", "%Y-%m-%d"
        )
    elif "中旬" in date_str:
        parsed_date = datetime.strptime(
            f"{date_str[:4]}-{date_str[5:7]}-15", "%Y-%m-%d"
        )
    elif "下旬" in date_str:
        year = int(date_str[:4])
        month = int(date_str[5:7])
        last_day = (datetime(year, month + 1, 1) - timedelta(days=1)).day
        parsed_date = datetime.strptime(
            f"{date_str[:4]}-{date_str[5:7]}-{last_day}", "%Y-%m-%d"
        )
    else:
        year = int(date_str[:4])
        month = int(date_str[5:7])
        last_day = (datetime(year, month + 1, 1) - timedelta(days=1)).day
        parsed_date = datetime.strptime(
            f"{date_str[:4]}-{date_str[5:7]}-{last_day}", "%Y-%m-%d"
        )
    return parsed_date.strftime("%Y-%m-%dT%H:%M:%S.%fZ")
