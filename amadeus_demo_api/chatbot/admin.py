from django.contrib import admin
from .models import ChatHistory, ChatbotFlightActionLog, ChatSession

@admin.register(ChatHistory)
class ChatHistoryAdmin(admin.ModelAdmin):
    # 모든 필드를 기본 순서대로 보여줌
    pass

@admin.register(ChatbotFlightActionLog)
class ChatbotFlightActionLogAdmin(admin.ModelAdmin):
    pass

@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    pass
