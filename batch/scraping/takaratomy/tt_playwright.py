from bs4 import BeautifulSoup
import os
from datetime import datetime
from playwright.sync_api import sync_playwright

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__)).replace("\\", "/")
print_date_format = datetime.today().strftime("%Y%m%d")


TAKARATOMY_NEW_URL = "https://www.takaratomy-arts.co.jp/items/gacha/"
TAKARATOMY_NEW_PAGE_PARAM = "page"

url = TAKARATOMY_NEW_URL + "?" + TAKARATOMY_NEW_PAGE_PARAM + "=5"


with sync_playwright() as p:
    browser = p.firefox.launch(headless=True)
    page = browser.new_page()
    page.goto(url)
    html = page.content()
    browser.close()

# 페이지의 HTML을 BeautifulSoup로 파싱
soup = BeautifulSoup(html, "html.parser")


with open(
    CURRENT_DIR + f"/0-html/{print_date_format}.html", "w", encoding="utf-8"
) as f:
    f.write(soup.prettify())
