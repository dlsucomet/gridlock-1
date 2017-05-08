"""
WSGI config for gridlock project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/1.11/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "gridlock.settings")

# TODO: Use Django WhiteNoise when deploying to Heroku (see https://devcenter.heroku.com/articles/django-assets)
application = get_wsgi_application()
