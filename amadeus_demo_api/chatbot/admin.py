from django.contrib import admin

from .models import ChatHistory,ChatbotFlightActionLog

admin.site.register(ChatHistory)
admin.site.register(ChatbotFlightActionLog)