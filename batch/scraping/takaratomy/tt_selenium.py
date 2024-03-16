# selenium을 이용한 타카라토미 사이트 신상 스크래핑

TAKARATOMY_NEW_URL = "https://www.takaratomy-arts.co.jp/items/gacha/"
TAKARATOMY_NEW_PAGE_PARAM = "page"

from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

from bs4 import BeautifulSoup
import os
from datetime import datetime

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__)).replace("\\", "/")
print_date_format = datetime.today().strftime("%Y%m%d")


# Chrome 옵션 설정
chrome_options = Options()
# headless 모드 설정, 브라우저가 실행되지 않고 백그라운드에서 실행
chrome_options.add_argument("--headless")

# Chrome 드라이버 설정
driver = webdriver.Chrome(
    service=ChromeService(ChromeDriverManager().install()), options=chrome_options
)

url = TAKARATOMY_NEW_URL + "?" + TAKARATOMY_NEW_PAGE_PARAM + "=5"

# 페이지 이동
driver.get(url)

# 페이지가 완전히 로드될 때까지 대기
WebDriverWait(driver, 10).until(
    # 아래 CSS 선택자가 로드될 때까지 대기
    # 클래스명 dbitems의 하위에 a 태그
    EC.presence_of_element_located((By.CSS_SELECTOR, ".dbitems a"))
)

# 페이지의 HTML 가져오기
html = driver.page_source

# 페이지의 HTML을 BeautifulSoup로 파싱
soup = BeautifulSoup(html, "html.parser")

with open(
    CURRENT_DIR + f"/0-html/{print_date_format}.html", "w", encoding="utf-8"
) as f:
    f.write(soup.prettify())

# 필요한 작업 수행 후 드라이버 종료
driver.quit()
