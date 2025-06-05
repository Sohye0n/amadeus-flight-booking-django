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
const select_edit = document.getElementById('edit_select');
// 수정: HTML 구조에 맞게 셀렉터 변경
const user_info = document.querySelector('#user');
const user_edit = document.querySelector('.edit');

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
    try {
        responseProfile = await apiClient.get('me/');
        responseProfile = responseProfile.data;
        responsePassport = await apiClient.get('passport/list');
        responsePassport = responsePassport.data;

        // 프로필 채우기
        profileSection.querySelector('.firstname_value').textContent = responseProfile.first_name || '';
        profileSection.querySelector('.lastname_value').textContent = responseProfile.last_name || '';
        profileSection.querySelector('.email_value').textContent = responseProfile.email_address || '';
        profileSection.querySelector('.birthdate_value').textContent = responseProfile.date_of_birth || '';
        profileSection.querySelector('.gender_value').textContent = responseProfile.gender || '';

        // 유저 select 채우기 (배열인지 확인)
        if (Array.isArray(responsePassport)) {
            responsePassport.forEach((_, idx) => {
                const option_info = document.createElement('option');
                option_info.value = idx;
                option_info.textContent = `User${idx + 1}`;
                select_info.appendChild(option_info);

                const option_edit = document.createElement('option');
                option_edit.value = idx;
                option_edit.textContent = `User${idx + 1}`;
                select_edit.appendChild(option_edit);
            });

            // 유저 1로 초기 화면 세팅 (첫 번째 패스포트 정보가 있는 경우)
            if (responsePassport.length > 0) {
                Object.keys(keys).forEach(key => {
                    const target_info = user_info.querySelector(`.${key}_value`);
                    if (target_info) {
                        target_info.textContent = responsePassport[0][key] || '';
                    }
                    
                    // 수정: edit 폼의 input/select 요소들 채우기
                    const target_edit_input = document.querySelector(`#${key}`);
                    if (target_edit_input) {
                        target_edit_input.value = responsePassport[0][key] || '';
                    }
                });
            }
        }
    } catch (error) {
        console.error('데이터 로딩 중 오류 발생:', error);
    }
});

document.getElementById('info-select').addEventListener('change', (event) => {
    const selectedIndex = parseInt(event.target.value);
    if (selectedIndex === -1 || !responsePassport || selectedIndex >= responsePassport.length) return;
    
    const passport = responsePassport[selectedIndex];

    Object.keys(keys).forEach(key => {
        const target = user_info.querySelector(`.${key}_value`);
        if (target) target.textContent = passport[key] || '';
    });
});

document.getElementById('edit_select').addEventListener('change', (event) => {
    const selectedIndex = parseInt(event.target.value);
    if (selectedIndex === -1 || !responsePassport || selectedIndex >= responsePassport.length) return;
    
    const passport = responsePassport[selectedIndex];

    Object.keys(keys).forEach(key => {
        // 수정: edit 폼의 input/select 요소들 채우기
        const target_edit_input = document.querySelector(`#${key}`);
        if (target_edit_input) {
            target_edit_input.value = passport[key] || '';
        }
    });
});

// 수정: 폼 제출 이벤트 리스너 수정
const editForm = document.getElementById('edit-form');
if (editForm) {
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // 폼의 기본 제출 동작 막음 (페이지 새로고침 방지)
      
        // 폼 데이터 수집 - ID로 정확히 찾기
        const data = {
          name: document.getElementById('name').value,
          gender: document.getElementById('gender').value,
          date_of_birth: document.getElementById('date_of_birth').value,
          nationality: document.getElementById('nationality').value,
          birth_place: document.getElementById('birth_place').value,
          number: document.getElementById('number').value,
          issuance_date: document.getElementById('issuance_date').value,
          issuance_location: document.getElementById('issuance_location').value,
          expiry_date: document.getElementById('expiry_date').value
        };
      
        try {
          const response = await apiClient.post('passport/add/', data);
          console.log('서버 응답:', response.data);
          alert('정보가 성공적으로 저장되었습니다.');
        } catch (err) {
          console.error('에러 발생:', err);
          alert('저장 중 오류가 발생했습니다.');
        }
    });
}
