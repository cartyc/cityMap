FROM python:alpine3.6
MAINTAINER chriscartydev@gmail.com

COPY requirements.txt ./
RUN pip install requirements.txt
COPY . .

expose 8000

CMD ['python', 'manage.py', 'runserver', '0.0.0.0:8000']
