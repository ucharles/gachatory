# 価格:300円(税込) => 300

import re


def extract_price_from_string(price: str) -> int:
    """
    Find patterns of price and remove the non-numeric characters.
    """

    # Find the price pattern
    pattern = re.compile(r"(\d+)")
    match = pattern.search(price)

    # If the pattern is found, return the price
    if match:
        return int(match.group(1))
    else:
        return None
