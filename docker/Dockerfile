# Image for basic mapping app
FROM python:alpine3.6
MAINTAINER chriscartydev@gmail.com

RUN mkdir /code
RUN mkdir -p /run/nginx
WORKDIR /code

COPY src /code

RUN apk add --update \
	python3-dev \
	py3-psycopg2 \
	nginx \
	openrc --no-cache &&\
	pip install -r /code/requirements.txt && \
	cp django_project /etc/nginx/nginx.conf &&\
	adduser -D -u 1000 django -h /code

# COPY django_project /etc/nginx/nginx.conf

RUN chmod +x /code/entrypoint.sh

ENV secret=pdii$8zkhafjar1r+5a6j39l(zi)2%c5cef1og%y&cg9!^)ab&

USER django
ENTRYPOINT ["/code/entrypoint.sh"]
EXPOSE 8000

