FROM python:alpine3.6
MAINTAINER chriscartydev@gmail.com

COPY requirements.txt .
RUN apk add --update \
	python3-dev \
	py3-psycopg2 && \
	pip install -r requirements.txt
COPY . .
expose 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
