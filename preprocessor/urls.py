# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from . import views
from django.conf.urls import url


app_name = 'preprocessor'
urlpatterns = [
    url(r'^location_list/$', views.location_list, name='location_list'),
    url(r'^location_geometry/', views.location_geometry, name='location_geometry'),
    url(r'^location_recommended_predefined_means/', views.location_recommended_predefined_means,
        name='location_recommended_predefined_means'),
]
