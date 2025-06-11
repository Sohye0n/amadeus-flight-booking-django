from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .views import FlightSearchView, FlightPriceView, FlightCreateOrderView, FlightOrderRetrieveView, FlightOrderCancelView,FlightCreateOrderByIndexView
from django.test.client import RequestFactory
from .models import FlightOrder
from chatbot.models import ChatHistory
class AmadeusIntentDispatcherView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        ai_response = request.data  # 이미 AI 서버 응답이라고 가정
        #print("AI 서버 응답 debug:", ai_response)
        #print("dispatcher user:", request.user)
        #print("dispatcher auth:", getattr(request, "auth", None))
        intent_type = ai_response.get("type")
        success = ai_response.get("success")

        if not success:
            # 누락된 필드 반환 (앞서 설명한 형식)
            missing_fields = [k for k, v in ai_response.items() if v is False and k not in ['type', 'success','number']]
            message = "\n".join([f"{field} 값이 필요합니다." for field in missing_fields])
            return Response({
                "type": intent_type,
                "status": "failed",
                "missing_fields": missing_fields,
                "message": message
            }, status=200)

        # 성공 케이스: intent 타입에 따라 분기 처리
        if intent_type == "search":
            return FlightSearchView().post(request)
        # elif intent_type == "price":
        #     return FlightPriceView().post(request)
        elif intent_type == "booking with number":
            number = ai_response.get("number")
            if number:
                request.data["number"] = number
                return FlightCreateOrderByIndexView().post(request)

            flight_offers = ai_response.get("flightOffers")
            if flight_offers:
                # Step 1: 가격 확인 요청
                factory = RequestFactory()
                pricing_request = factory.post(
                    "/api/booking/price/",
                    data={"flightOffers": flight_offers},
                    content_type="application/json"
                )
                pricing_request.user = request.user
                pricing_request._force_auth_user = request.user

                pricing_response = FlightPriceView().post(pricing_request)
                if pricing_response.status_code != 200:
                    return pricing_response

                priced_offers = pricing_response.data["data"]["flightOffers"]

                # Step 2: 예약 
                booking_request = factory.post(
                    "/api/booking/create/",
                    data={"flightOffers": priced_offers},
                    content_type="application/json"
                )
                booking_request.user = request.user
                booking_request._force_auth_user = request.user

                return FlightCreateOrderView().post(booking_request)

            return Response({
                "type": intent_type,
                "status": "failed",
                "message": "ERROR: number 또는 flightOffers 정보가 필요합니다."}, status=400)

        elif intent_type == "list":
            flight_order_id = ai_response.get("flight_order_id")
            if not flight_order_id:
                number = int(ai_response.get("number", 1))
                orders = FlightOrder.objects.filter(user=request.user).order_by("-created_at")
                if not orders.exists():
                    return Response({
                        "type": intent_type,
                        "status": "failed",
                        "message": "ERROR: 예약 내역이 없습니다."}, status=400)
                try:
                    selected_order = orders[number - 1]
                except IndexError:
                    return Response({
                        "type": intent_type,
                        "status": "failed",
                        "message": f"ERROR: {number}번째 예약을 찾을 수 없습니다."}, status=400)
                flight_order_id = selected_order.flight_order_id
                print("id: ", flight_order_id)
            return FlightOrderRetrieveView().get(request, flight_order_id=flight_order_id)


        elif intent_type == "cancel":
            number = int(ai_response.get("number", 1))#일단 1로 설정하자자
            orders = FlightOrder.objects.filter(user=request.user, status="CONFIRMED").order_by("-created_at")
            if not orders.exists():
                return Response({
                    "type": intent_type,
                    "status": "failed",
                    "message": "ERROR: 취소할 수 있는 예약이 없습니다."}, status=400)
            try:
                selected_order = orders[0]
                #selected_order = orders[number - 1]
            except IndexError:
                return Response({
                    "type": intent_type,
                    "status": "failed",
                    "message": f"ERROR: {number}번째 예약을 찾을 수 없습니다."}, status=400)

            flight_order_id = selected_order.flight_order_id
            return FlightOrderCancelView().post(request, flight_order_id=flight_order_id)