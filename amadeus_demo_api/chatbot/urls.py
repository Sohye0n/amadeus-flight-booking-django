from django.urls import path
from .views import AskChatbotView, ChatHistoryView, sessionListView

urlpatterns = [
    path('chat/ask/', AskChatbotView.as_view(), name='send-message'),
    path('chat/history/', ChatHistoryView.as_view(), name='chat-history'),
    path('chat/sessions', sessionListView.as_view(), name='session-List'),
]
