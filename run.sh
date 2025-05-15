#!/bin/bash

set -a
source ../flight-booking.env
set +a

echo "[*] 현재 경로: $(pwd)"
echo "[*] 현재 python 경로: $(which python)"
echo "[*] 현재 가상환경: $VIRTUAL_ENV"

source /home/ubuntu/amadeus-flight-booking-django/venv/bin/activate
echo "[*] 가상환경 활성화 후 python 경로: $(which python)"
echo "[*] 가상환경 활성화 후 manage.py 존재 여부:"

cd /home/ubuntu/amadeus-flight-booking-django
python amadeus_demo_api/manage.py runserver 0.0.0.0:8001
