from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver import ActionChains

from bs4 import BeautifulSoup
import pyautogui

import urllib.request
import json
import os

import time


def SaveAs(driver, target):
    actionChains = ActionChains(driver)
    actionChains.context_click(target).perform()

    time.sleep(1)
    pyautogui.press("down")
    pyautogui.press("down")
    pyautogui.press("down")
    pyautogui.press("down")
    pyautogui.press("down")
    pyautogui.press("down")
    pyautogui.press("down")
    pyautogui.press("enter")
    time.sleep(1)


def google_image_search(query):
    driver = webdriver.Chrome()

    url = "https://www.google.com/search?q=" + query + "&tbm=isch"

    driver.get(url)
    try:
        WebDriverWait(driver, 2).until(
            EC.presence_of_element_located((By.XPATH, '//div[@data-ri="0"]'))
        )
    except Exception as e:
        print("No search result")
        driver.close()
        return None

    first_image = driver.find_element(By.XPATH, '//div[@data-ri="0"]')
    first_image.click()
    html = driver.page_source
    time.sleep(2)
    big_image = driver.find_element(By.XPATH, '//img[@class="r48jcc pT0Scc"]')

    SaveAs(driver, big_image)

    try:
        driver.switch_to.window(driver.window_handles[1])
    except Exception as e:
        print("Can't read image link")
        driver.close()
        return None

    image_url = driver.current_url

    driver.close()

    return image_url
