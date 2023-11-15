from typing import List
from datetime import datetime, timedelta


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


def date_convert_to_iso(dates: str):
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
            parsed_date = datetime(year, month, calculate_last_day(year, month))

        return parsed_date.strftime("%Y-%m-%dT%H:%M:%S.%fZ")
    except:
        print('"' + date_str + '"', e)
        return "Invalid date string"
