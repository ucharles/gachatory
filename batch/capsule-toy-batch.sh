#!/bin/bash

# Python 스크립트 파일들의 경로를 배열에 저장
scraping_path="/home/local-optimum/git/gachatory/batch/scraping"

scripts=(
    "/bandai/bandai.py"
    "/takaratomy/tt.py"
    "/kitan/kt.py"
    "/bushiroad/br.py"
    "/korokoro/korokoro.py"
    "/tarlin/tl.py"
)

# 로그 파일 경로
log_file="${scraping_path}/log_file.log"

# 스크립트 배열을 순회하면서 각 스크립트 실행
for script in "${scripts[@]}"; do
    # 각 스크립트를 실행하고 로그 파일에 결과 저장
    python3 "${scraping_path}${script}" >> "$log_file" 2>&1
    # 실행 성공 여부와 상관없이 다음 스크립트로 계속
done

# 태그 부여

# 디렉토리 변경
cd /home/local-optimum/git/gachatory/batch/utils
python3 -c "from crud_mongodb import search_capsule_toy_and_update_tag; search_capsule_toy_and_update_tag()" >> "log_file.log" 2>&1

# 번역

# 디렉토리 변경
cd /home/local-optimum/git/gachatory/batch/translate
python3 ./capsule_translator.py >> log_file.log 2>&1

# 알림

# 디렉토리 변경
cd /home/local-optimum/git/gachatory/batch/notification
python3 ./notification.py >> log_file.log 2>&1