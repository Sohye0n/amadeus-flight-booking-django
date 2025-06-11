import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from .models import ChatHistory, ChatSession
from .serializers import ChatHistorySerializer
from .models import ChatbotFlightActionLog
from booking.dispatch import *
from django.test.client import RequestFactory

class sessionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        sessions = ChatSession.objects.filter(user=user).order_by('-created_at')
        
        session_list = [
            {
                "sessionId": session.session_id,
                "title": session.title
            }
            for session in sessions
        ]
        
        return Response(data=session_list, status=200)

class ChatHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        session_id = request.data.get("sessionId")
        chat_records = ChatHistory.objects.filter(
            user=request.user,
            session_id=session_id
        ).order_by('timestamp')

        chat_history_list = []
        chat_history_list = [item for r in chat_records for item in (r.question, r.answer)]

        #serializer = ChatHistorySerializer(chat_records, many=True)
        return Response({"chat_history": chat_history_list}, status=status.HTTP_200_OK)
    
@method_decorator(csrf_exempt, name='dispatch')    
class AskChatbotView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        print("request.user:", request.user)
        print("auth:", request.auth)
        print("Authorization header:", request.META.get('HTTP_AUTHORIZATION'))
        question = request.data.get('question')
        session_id = request.data.get('sessionId')

        if not all([question, session_id]):
            return Response({
                "status": "failed",
                "message": "question과 sessionId가 필요합니다."
            }, status=400)

        user = request.user

        # 최초의 채팅일 경우 db에 세션 아이디와 제목 저장
        if not ChatSession.objects.filter(user=user, session_id=session_id).exists():
            ChatSession.objects.create(
                user=user,
                session_id=session_id,
                title=question[:30]
            )
        
        chat_records = ChatHistory.objects.filter(user=user).order_by('timestamp')
        chat_records = ChatHistory.objects.filter(user=user, session_id=session_id).order_by('timestamp')
        chat_history_list = [q for record in chat_records for q in (record.question, record.answer)]
        chat_history_list.append(question)

        payload = {
            "chat_history": chat_history_list
        }
        print("checkmsgg")
        try:
            ai_response = requests.post(
                "http://172.31.25.19:8080/question",
                json=payload,
                timeout=5
            )
            ai_data = ai_response.json()
            print("AI 서버 응답:", ai_data)
        except Exception as e:
            response_data = {
                "status": "failed",
                "message": "ERROR: AI 서버 연결 실패", 
                "detail": str(e)
            }
            ChatHistory.objects.create(user=user, question=question, session_id=session_id,answer=str(response_data),ai_answer="")
            return Response(response_data, status=500)

        # 질문 기록 먼저 저장
        chat_record = ChatHistory.objects.create(user=user, question=question, session_id=session_id,answer=str(ai_data))
        ai_data["sessionId"] = session_id
        ai_data["user"] = user
        ai_data["question"] = question
        ai_data["chatHistory_id"] = chat_record.id
        # dispatcher로 넘기기
        # request.data를 ai_data로 덮기 위해 새 요청 생성
        factory = RequestFactory()
        new_request = factory.post(
            "/booking/dispatch/",  # (뷰 내부에서만 씀)
            data=ai_data,
            content_type='application/json'
        )
        new_request._force_auth_user = request.user
        #new_request.user = request.user

        # as_view()는 Django의 CBV 디스패처
        return AmadeusIntentDispatcherView.as_view()(new_request)
