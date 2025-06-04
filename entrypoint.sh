#!/bin/bash
set -e  # 오류 시 즉시 종료

# 마이그레이션 스크립트 실행

# 서버 실행
exec python amadeus_demo_api/manage.py makemigrations
exec python amadeus_demo_api/manage.py migrate
exec python amadeus_demo_api/manage.py runserver 0.0.0.0:8000
