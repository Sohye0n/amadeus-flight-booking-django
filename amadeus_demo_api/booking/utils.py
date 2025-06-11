import json
from chatbot.models import ChatHistory  # 정확한 위치로 수정 필요

def update_chat_history_answer(request, response_data):
    chat_history_id = request.data.get("chatHistory_id")
    if chat_history_id:
        try:
            chat_record = ChatHistory.objects.get(id=chat_history_id)
            chat_record.ai_answer = json.dumps(response_data, ensure_ascii=False)
            chat_record.save()
        except ChatHistory.DoesNotExist:
            pass