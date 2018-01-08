from django.conf.urls import url
from . import views

urlpatterns = [
	url(r'^$', views.search.as_view(), name="text_search"),
	url(r'^map', views.map.as_view(), name="map_search"),
]