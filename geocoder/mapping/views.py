from django.shortcuts import render
from django.views.generic import View


# Create your views here.
class map(View):

	def get(self, request):
		template = "map.html"
		return render(request, template, {})


class search(View):

	def get(self, request):

		tempalte = "search.html"
		return render(request, tempalte, {})