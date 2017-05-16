# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from annoying.functions import get_object_or_None
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from preprocessor.models import Location
from preprocessor.utils import get_location_geometry
from .computations import LatticeLayout, RandomLayout, NBlobLayout


@csrf_exempt
def generate_stop_layout(request):
    if request.method == 'POST':
        # stop_layout_nodes = LatticeLayout(20, 350, (120.9747, 14.5896)).generate()

        # location = get_object_or_None(Location, pk=1)
        # location_geometry = get_location_geometry(location)
        # stop_layout_nodes = RandomLayout(20, 350, location_geometry).generate()

        # stop_layout_nodes = NBlobLayout(20, 350, [(120.9670, 14.5855), (120.9660, 14.5900)], 65).generate()
        stop_layout_nodes = NBlobLayout(100, 350, [(120.9747, 14.6184), (121.0007, 14.5796)], 65).generate()

        return JsonResponse({'stop_layout_nodes': [n.__dict__ for n in stop_layout_nodes]})
