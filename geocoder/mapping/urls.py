from django.conf.urls import url
from . import views

urlpatterns = [
	url(r'^$', views.map.as_view(), name="map"),
]