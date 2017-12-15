#!/bin/sh

python manage.py collectstatic --no-input
python manage.py migrate
rc-service nginx restart

echo "Starting GUnicorn"
exec gunicorn --bind 0.0.0.0:8000 geocoder.wsgi&

echo "Starting nginx"
exec nginx -g "daemon off;"