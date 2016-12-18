#!/bin/sh

set -ev

grunt eslint
grunt test-js
python manage.py migrate --fake-initial
python manage.py test
flake8 .
bandit -r .
