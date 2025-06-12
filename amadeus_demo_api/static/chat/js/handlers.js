// "search" 타입 질문에 대한 답변 가공
function handleSearch(data) {

    console.log("Search handler:", data);
    console.log(data.status)
    if(data.status==="failed") return(data.message);
    
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
    return matchingAnwers.join("\n\n");
}

// "booking with number" 타입 질문에 대한 답변 가공
function handleBooking(data) {

    function formatDateTime(dateTimeStr) {
      const date = new Date(dateTimeStr);
      return `${date.getFullYear()}년 ${
        date.getMonth() + 1
      }월 ${date.getDate()}일 ${String(date.getHours()).padStart(
        2,
        '0'
      )}:${String(date.getMinutes()).padStart(2, '0')}`;
    }
  
    console.log("Booking handler:", data);
    console.log(data.status)
    if(data.status==="failed") return(data.message);
    let matchingAnwers;
    
    data.flightOffers.map((offer, index) => {
        const {
            flight_order_id,
            price,
            departure,
            arrival,
            departure_time,
            arrival_time,
            airline,
            number_of_stops
        } = offer;

        const departure_time_ = new Date(departure_time);
        const arrival_time_ = new Date(arrival_time);
        const durationMs = arrival_time_ - departure_time_;
        const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
        const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
        matchingAnwers=`예약이 완료되었습니다.\n 예약 코드는 ${flight_order_id} 입니다.\n
          예약하신 항공권 정보를 다시 알려드려요.\n ${airline} 항공.\n${departure}에서 출발하여 ${arrival}에 도착합니다.\n
          출발 시간은 ${formatDateTime(departure_time_)}, 도착 시간은 ${formatDateTime(arrival_time_)}로
          총 ${durationHours}시간 ${durationMinutes}분이 소요됩니다.\n가격은 ${price}입니다. 경유 ${number_of_stops}회.`;
    })
    return matchingAnwers;
}

// "list" 타입 질문에 대한 답변 가공 (예약 후 조회)
function handleList(data) {

    function formatDateTime(dateTimeStr) {
      const date = new Date(dateTimeStr);
      return `${date.getFullYear()}년 ${
        date.getMonth() + 1
      }월 ${date.getDate()}일 ${String(date.getHours()).padStart(
        2,
        '0'
      )}:${String(date.getMinutes()).padStart(2, '0')}`;
    }
  
    console.log("list handler:", data);
    console.log(data.status)
    if(data.status==="failed") return(data.message);
    let matchingAnwers;
    
    data.orderData.map((offer, index) => {
        const {
            flight_order_id,
            price,
            departure,
            arrival,
            departure_time,
            arrival_time,
            airline,
            number_of_stops
        } = offer;

        const departure_time_ = new Date(departure_time);
        const arrival_time_ = new Date(arrival_time);
        const durationMs = arrival_time_ - departure_time_;
        const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
        const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
        matchingAnwers=`
          요청하신 예약 내역에 대한 정보를 알려드려요.\n
          예약 코드는 ${flight_order_id} 입니다.\n
          예약하신 항공권 정보를 다시 알려드려요.\n
          ${airline} 항공.\n${departure}에서 출발하여 ${arrival}에 도착합니다.\n
            출발 시간은 ${formatDateTime(departure_time_)}, 도착 시간은 ${formatDateTime(arrival_time_)}로
            총 ${durationHours}시간 ${durationMinutes}분이 소요됩니다.\n가격은 ${price}입니다. 경유 ${number_of_stops}회.`;
    })
    return matchingAnwers;
}

// cancel 타입에 대한 요청 처리
function handleCancel(data){
  console.log("cancel handler:", data);
  console.log(data.status)
  if(data.status==="failed") return(data.message);
  else return ("성공적으로 취소되었습니다.");
}

function defaultHandler(data) {
    console.log("Default handler:", data);
    return data.message;
}