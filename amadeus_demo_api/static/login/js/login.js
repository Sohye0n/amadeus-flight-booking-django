const csrftoken = getCookie('csrftoken');

// 로그인 요청 함수
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const redirect = document.getElementById('redirect').value;
    
    fetch('/api/login/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify({
            username: username,
            password: password,
            redirect: redirect
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.access) {
            // JWT 토큰 저장
            localStorage.setItem('accessToken', data.access);
            if (data.refresh) {
                localStorage.setItem('refreshToken', data.refresh);
            }
            alert(data.redirect);
            console.log(data.redirect)
        } else {
            alert('로그인 실패');
        }
    })
    .catch(error => {
        console.error('로그인 오류:', error);
        alert('로그인 요청 중 오류 발생');
    });
}
