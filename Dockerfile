# Image for basic mapping app
FROM python:alpine3.6
MAINTAINER chriscartydev@gmail.com

RUN mkdir /code
RUN mkdir -p /run/nginx
WORKDIR /code

COPY . /code

RUN apk add --update \
	python3-dev \
	py3-psycopg2 \
	nginx \
	openrc --no-cache &&\
	pip install -r /code/requirements.txt

COPY django_project /etc/nginx/nginx.conf

RUN chmod +x /code/entrypoint.sh

ENTRYPOINT ["/code/entrypoint.sh"]
EXPOSE 80 2222
