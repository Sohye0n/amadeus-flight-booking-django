// "search" 타입 질문에 대한 답변 가공
function handleSearch(data) {

    console.log("Search handler:", data);
    
    function formatDateTime(dateTimeString) {
        const date = new Date(dateTimeString);
        return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    }
    
    let matchingAnwers=[]
    data.flightOffers.map((offer, index) => {
        const {
            departure_airport,
            arrival_airport,
            departure_time,
            arrival_time,
            price,
            airline,
            number_of_stops
        } = offer;
    
        const departure = new Date(departure_time);
        const arrival = new Date(arrival_time);
        const durationMs = arrival - departure;
        const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
        const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
        matchingAnwers.push(`항공권 ${index + 1}\n${airline} 항공.\n${departure_airport}에서 출발하여 ${arrival_airport}에 도착합니다.\n
            출발 시간은 ${formatDateTime(departure_time)}, 도착 시간은 ${formatDateTime(arrival_time)}로
            총 ${durationHours}시간 ${durationMinutes}분이 소요됩니다.\n가격은 ${price}입니다. 경유 ${number_of_stops}회.`);
    })
    return matchingAnwers
}

// "search" 타입 질문에 대한 답변 가공
function handleFlightOrder(data) {
    function formatDateTime(dateTimeStr) {
      const date = new Date(dateTimeStr);
      return `${date.getFullYear()}년 ${
        date.getMonth() + 1
      }월 ${date.getDate()}일 ${String(date.getHours()).padStart(
        2,
        '0'
      )}:${String(date.getMinutes()).padStart(2, '0')}`;
    }
  
    function formatISODuration(durationStr) {
      // "PT15H30M" → "15시간 30분"
      const hourMatch = durationStr.match(/(\d+)H/);
      const minMatch = durationStr.match(/(\d+)M/);
  
      const hours = hourMatch ? `${hourMatch[1]}시간` : '';
      const minutes = minMatch ? ` ${minMatch[1]}분` : '';
      return `${hours}${minutes}`.trim();
    }
  
    function translatePurpose(purpose) {
      switch (purpose) {
        case 'STANDARD':
          return '일반';
        case 'EMERGENCY':
          return '긴급';
        default:
          return purpose; // 그대로 출력
      }
    }
  
    function flightInfo(flightOffers) {
      let arr=[];
      flightOffers.forEach((flightOffer, index)=>{
        const segment = flightOffer.itineraries[0].segments[0];
        const pricing = flightOffer.travelerPricings[0];
        const fareDetail = pricing.fareDetailsBySegment[0];
        
        const baggageInfo = fareDetail.includedCheckedBags;
  
        const departure = segment.departure;
        const arrival = segment.arrival;
  
        const departureTime = formatDateTime(departure.at);
        const arrivalTime = formatDateTime(arrival.at);
  
        const totalPrice = flightOffer.price.grandTotal;
        const currency = flightOffer.price.currency;
  
        const airline = segment.carrierCode;
        const flightNumber = segment.number;
        const duration = formatISODuration(segment.duration);
  
        const cabinClass = fareDetail.cabin;
        const bookingClass = fareDetail.class;
        const bagCount = baggageInfo?.quantity ?? '정보 없음';
  
        index+=1
  
        if(index===1){
          arr.push(`
            선택하신 항공편 정보에 대해 다시 한번 알려드려요.
  
            ✈️ 출발
            ${departure.iataCode}공항 ${departure.terminal ?? 'N/A'}번 터미널에서 ${departureTime}에 출발합니다.
  
            🛬 도착
            ${arrival.iataCode}공항 ${arrival.terminal ?? 'N/A'}번 터미널에 ${arrivalTime}에 도착합니다.
  
            📄 기타 정보
            항공사: ${airline}, 항공편 번호: ${airline}${flightNumber}
            비행 시간: ${duration}
            `.trim());
        }
  
        arr.push(`
            예약자 ${index}의 항공권 정보에 대해 알려드려요.
  
            💰 가격
            세금 포함 총 ${totalPrice} ${currency}입니다.
  
            💺 좌석 정보
            좌석 등급은 ${cabinClass} 클래스(${bookingClass})이며, 수하물은 ${bagCount}개까지 포함되어 있어요.
            `.trim());
        })
        return arr;
    }
  
    function travelorInfo(travelers) {
      let arr = [];
      travelers.forEach((traveler, index) => {
        const { name, documents, contact } = traveler;
  
        const passport = documents.find(doc => doc.documentType === 'PASSPORT');
  
        index+=1
  
        arr.push(
          `
                  입력하신 예약자 ${index} 정보에 대해 알려드려요.
  
                  👤 이름
                  first name: ${name.firstName}, last name: ${name.lastName}
  
                  🛂 여권정보
                  여권번호: ${passport.number}
                  여권 만료 기한: ${formatDateTime(passport.expiryDate)}
                  국적: ${passport.nationality}
  
                  📧 연락처
                  이메일: ${contact.emailAddress}, ${translatePurpose(
            contact.purpose
          )}용   
              `.trim()
        );
      });
      return arr;
    }
  
    console.log('Flight Order handler:', data);
    let matchingAnwers = [];
  
    // 항공/예약자 관련 정보 나누어 처리
    const flightOffer = data.data.flightOffers;
    flightInfo(flightOffer).forEach(Element => matchingAnwers.push(Element));
    const travelers = data.data.travelers;
    travelorInfo(travelers).forEach(Element => matchingAnwers.push(Element));
  
    return matchingAnwers;
}

function handleList(data) {
// 리스트 렌더링
console.log("List handler:", answer);
return answer;
}

function defaultHandler(data) {
// 기본 처리
console.log("Default handler:", answer);
return answer;
}