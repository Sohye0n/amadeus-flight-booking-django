#!/bin/bash
set -e  # 오류 시 즉시 종료

pip install -r requirements.txt

# 서버 실행
python amadeus_demo_api/manage.py makemigrations --noinput
python amadeus_demo_api/manage.py migrate
exec python amadeus_demo_api/manage.py runserver 0.0.0.0:8000
