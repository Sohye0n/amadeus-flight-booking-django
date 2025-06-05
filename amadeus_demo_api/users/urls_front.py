from django.urls import path
from .views import *

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),  # 로그인 페이지
    path('mypage/', MypageView.as_view(), name='mypage'),  # 로그인 페이지
]