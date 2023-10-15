from typing import List
from datetime import datetime, timedelta


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
        month = int(date_str[5:7])

        mapping = {"上旬": "01", "中旬": "15", "下旬": "last_day"}

        if date_str[-2:] in mapping:
            if mapping[date_str[-2:]] == "last_day":
                last_day = (datetime(year, month + 1, 1) - timedelta(days=1)).day
                parsed_date = datetime(year, month, last_day)
            else:
                parsed_date = datetime(year, month, int(mapping[date_str[-2:]]))
        else:
            last_day = (datetime(year, month + 1, 1) - timedelta(days=1)).day
            parsed_date = datetime(year, month, last_day)

        return parsed_date.strftime("%Y-%m-%dT%H:%M:%S.%fZ")
    except:
        return "Invalid date string"
