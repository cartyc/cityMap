#!/bin/sh

python manage.py collectstatic --no-input

echo "Starting GUnicorn"
exec gunicorn --bind 0.0.0.0:8000 geocoder.wsgi