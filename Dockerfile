FROM python:3.10

ENV PYTHONUNBUFFERED=1

COPY . .

RUN chmod +x entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]

EXPOSE 8000
