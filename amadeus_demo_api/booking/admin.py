from django.contrib import admin
from .models import FlightOrder, FlightSearchRecord, FlightOrderRetrieveLog, FlightCancelLog, FlightOfferCandidate

admin.site.register(FlightOrder)
admin.site.register(FlightSearchRecord)
admin.site.register(FlightOrderRetrieveLog)
admin.site.register(FlightCancelLog)
admin.site.register(FlightOfferCandidate)
