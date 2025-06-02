let responseProfile;
let responsePassport;

const keys={
    "number": "string",
    "name": "string",
    "gender": "string",
    "issuance_date": "YYYY-MM-DD",
    "issuance_location": "string",
    "expiry_date": "YYYY-MM-DD",
    "nationality": "string",
    "birth_place": "string",
    "date_of_birth": "YYYY-MM-DD"
}
const reserveSection = document.querySelector('.reserve');
const editSection = document.querySelector('.edit');
const profileSection = document.querySelector('.profile');
const infoSection = document.querySelector('.info');
const navLinks = document.querySelectorAll('.nav-link');
const select_info = document.getElementById('info-select');
const select_edit = document.getElementById('edit-select');
const user_info = document.querySelector('.info .users .user');
const user_edit = document.querySelector('.edit')

document.addEventListener('DOMContentLoaded', function () {

    navLinks.forEach(link => {
      link.addEventListener('click', function (e) {
        const clickedText = link.textContent.trim();

        if (clickedText === '예약 내역') {
          reserveSection.style.display = 'block';
          editSection.style.display = 'none';
          profileSection.style.display = 'none';
          infoSection.style.display = 'none';
          
        } else {
          reserveSection.style.display = 'none';
          editSection.style.display = 'block';
          profileSection.style.display = 'block';
          infoSection.style.display = 'block';
        }
      });
    });
});


window.addEventListener('DOMContentLoaded', async function () {
    responseProfile = await apiClient.get('me/').data;
    responsePassport = await apiClient.get('passport/list').data;

    // 프로필 채우기
    profileSection.querySelector('.firstname_value').textContent=responseProfile.first_name;
    profileSection.querySelector('.lastname_value').textContent=responseProfile.last_name;
    profileSection.querySelector('.email_value').textContent=responseProfile.email_address;
    profileSection.querySelector('.birthdate_value').textContent=responseProfile.date_of_birth;
    profileSection.querySelector('.gender_value').textContent=responseProfile.gender;

    // 유저 select 채우기
    responsePassport.forEach((_, idx) => {
        const option = document.createElement('option');
        option.value = idx + 1;
        option.textContent = `User${idx + 1}`;
        select_info.appendChild(option);
        select_edit.appendChild(option);
    });

    // 유저 1로 초기 화면 세팅
    Object.keys(keys).forEach(key=>{
        const target_info=user_info.querySelector(`.${key}_value`);
        const target_edit=user_edit.querySelector(`.${key}_key`);
        if(target_info) target_info.textContent=responsePassport[0][key] ?? '';
        if(target_edit.tageName === 'INPUT' || target_edit.tageName === 'SELECT') target.value=esponsePassport[0][key] ?? '';
    });
  });

document.getElementById('info-select').addEventListener('change', (event)=>{
    
    const selectedIndex = select_info.selectedIndex;
    if (selectedIndex === -1) return;
    const passport = responsePassport[selectedIndex];

    Object.keys(keys).forEach(key => {
        const target = user_info.querySelector(`.${key}_value`);
        if (target) target.textContent = passport[key] ?? '';
    });
})

document.getElementById('edit-select').addEventListener('change', (event)=>{
    
    const selectedIndex = select_info.selectedIndex;
    if (selectedIndex === -1) return;
    const passport = responsePassport[selectedIndex];

    Object.keys(keys).forEach(key => {
        const target = user_info.querySelector(`.${key}_value`);
        if (target) target.textContent = passport[key] ?? '';
    });
})

document.querySelector('#edit-form input[type="submit"]').addEventListener('submit', async (e) => {
    e.preventDefault(); // 폼의 기본 제출 동작 막음 (페이지 새로고침 방지)
  
    // 폼 데이터 수집
    const data = {
      name: document.querySelector('.name').value,
      gender: document.querySelector('.gender').value,
      date_of_birth: document.querySelector('.date_of_birth').value,
      nationality: document.querySelector('.nationality').value,
      birth_place: document.querySelector('.birth_place').value,
      number: document.querySelector('.number').value,
      issuance_date: document.querySelector('.issuance_date').value,
      issuance_location: document.querySelector('.issuance_location').value,
      expiry_date: document.querySelector('.expiry_date').value
    };
  
    // 서버로 전송 (POST 예시)
    try {
      const response = await apiClient.post('/api/passport/add', data);
      console.log('서버 응답:', response.data);
    } catch (err) {
      console.error('에러 발생:', err);
    }
  });