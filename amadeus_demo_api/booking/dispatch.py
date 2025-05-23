from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .views import FlightSearchView, FlightPriceView, FlightCreateOrderView, FlightOrderRetrieveView, FlightOrderCancelView,FlightCreateOrderByIndexView
from django.test.client import RequestFactory
class AmadeusIntentDispatcherView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        ai_response = request.data  # 이미 AI 서버 응답이라고 가정
        print("dispatcher user:", request.user)
        print("dispatcher auth:", getattr(request, "auth", None))
        intent_type = ai_response.get("type")
        success = ai_response.get("success")

        if not success:
            # 누락된 필드 반환 (앞서 설명한 형식)
            missing_fields = [k for k, v in ai_response.items() if v is False and k not in ['type', 'success']]
            message = "\n".join([f"{field} 값이 필요합니다." for field in missing_fields])
            return Response({
                "success": False,
                "missing_fields": missing_fields,
                "message": message
            }, status=200)

        # 성공 케이스: intent 타입에 따라 분기 처리
        if intent_type == "search":
            return FlightSearchView().post(request)
        # elif intent_type == "price":
        #     return FlightPriceView().post(request)
        elif intent_type == "booking":
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

                # Step 2: 예약 요청
                booking_request = factory.post(
                    "/api/booking/create/",
                    data={"flightOffers": priced_offers},
                    content_type="application/json"
                )
                booking_request.user = request.user
                booking_request._force_auth_user = request.user

                return FlightCreateOrderView().post(booking_request)

            return Response({"error": "number 또는 flightOffers 정보가 필요합니다."}, status=400)

        elif intent_type == "retrieve":
            flight_order_id = ai_response.get("flight_order_id")
            return FlightOrderRetrieveView().get(request, flight_order_id=flight_order_id)

        elif intent_type == "cancel":
            flight_order_id = ai_response.get("flight_order_id")
            return FlightOrderCancelView().post(request, flight_order_id=flight_order_id)