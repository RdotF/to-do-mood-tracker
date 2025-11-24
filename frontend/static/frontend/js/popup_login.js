document.addEventListener("DOMContentLoaded", () => {
  const openLoginBtn = document.querySelector(".btn-login");
  const loginOverlay = document.querySelector(".login-overlay");
  const closeLoginBtn = loginOverlay?.querySelector(".close-btn");
  const loginForm = document.getElementById("loginForm");
  const loginErrorMessages = document.getElementById("loginErrorMessages");

  // Если элементы не найдены, выходим
  if (!openLoginBtn || !loginOverlay || !closeLoginBtn || !loginForm) {
    console.error("Не найдены необходимые элементы для формы входа");
    return;
  }

  // Открытие попапа входа
  openLoginBtn.addEventListener("click", () => {
    loginOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
  });

  // Закрытие попапа
  closeLoginBtn.addEventListener("click", () => {
    loginOverlay.classList.remove("active");
    document.body.style.overflow = "";
    resetLoginForm();
  });

  // Закрытие по клику на overlay
  loginOverlay.addEventListener("click", (e) => {
    if (e.target === loginOverlay) {
      loginOverlay.classList.remove("active");
      document.body.style.overflow = "";
      resetLoginForm();
    }
  });

  // Обработка отправки формы входа
  loginForm.addEventListener("submit", handleLoginSubmit);

  function handleLoginSubmit(e) {
    e.preventDefault();

    // Скрываем предыдущие ошибки
    if (loginErrorMessages) {
      loginErrorMessages.style.display = 'none';
      loginErrorMessages.innerHTML = '';
    }

    // Блокируем кнопку отправки
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Вход...';
    submitBtn.disabled = true;

    // Собираем данные формы
    const formData = new FormData(loginForm);
    const data = {
      username: formData.get('username'),
      password: formData.get('password')
    };

    // Валидация на клиенте
    if (!data.username || !data.password) {
      showLoginError('Пожалуйста, заполните все поля');
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      return;
    }

    // Отправляем запрос на сервер
    fetch('/api/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken()
      },
      body: JSON.stringify(data)
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => {
          throw err;
        });
      }
      return response.json();
    })
    .then(data => {
      // Успешный вход
      console.log('Вход успешен:', data);

      // Сохраняем информацию о пользователе в localStorage
      localStorage.setItem('user_id', data.user_id);
      localStorage.setItem('username', data.username);
      localStorage.setItem('is_authenticated', 'true');

      // ⭐ ВАЖНО: Делаем дополнительный запрос для создания сессии ⭐
      return createSession(data.user_id);
    })
    .then(() => {
      // Показываем сообщение об успехе
      showLoginSuccess('Вход выполнен успешно! Перенаправляем в профиль...');

      // Закрываем попап и перенаправляем на профиль через короткую задержку
      setTimeout(() => {
        loginOverlay.classList.remove("active");
        document.body.style.overflow = "";
        resetLoginForm();

        // ⭐ ПЕРЕНАПРАВЛЕНИЕ НА ПРОФИЛЬ ⭐
        window.location.href = '/profile/';
      }, 1500);
    })
    .catch(error => {
      // Обработка ошибок
      console.error('Ошибка входа:', error);
      showLoginError(getErrorMessage(error));
    })
    .finally(() => {
      // Разблокируем кнопку в любом случае
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    });
  }

  // Функция для создания сессии на сервере
  function createSession(userId) {
    return fetch('/api/create-session/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken()
      },
      body: JSON.stringify({ user_id: userId })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Ошибка создания сессии');
      }
      return response.json();
    });
  }

  function getCSRFToken() {
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
    return csrfToken ? csrfToken.value : '';
  }

  function showLoginError(message) {
    if (!loginErrorMessages) return;

    loginErrorMessages.innerHTML = `
      <div class="error-message">${message}</div>
    `;
    loginErrorMessages.style.display = 'block';
  }

  function showLoginSuccess(message) {
    if (!loginErrorMessages) return;

    loginErrorMessages.innerHTML = `
      <div class="success-message">${message}</div>
    `;
    loginErrorMessages.style.display = 'block';
    loginErrorMessages.style.backgroundColor = '#e6ffe6';
    loginErrorMessages.style.borderColor = '#99ff99';
  }

  function getErrorMessage(error) {
    if (typeof error === 'string') {
      return error;
    } else if (error.error) {
      return error.error;
    } else if (error.detail) {
      return error.detail;
    } else if (error.non_field_errors) {
      return error.non_field_errors.join(', ');
    } else {
      return 'Произошла ошибка при входе. Пожалуйста, проверьте логин и пароль.';
    }
  }

  function resetLoginForm() {
    loginForm.reset();
    if (loginErrorMessages) {
      loginErrorMessages.style.display = 'none';
      loginErrorMessages.innerHTML = '';
      loginErrorMessages.style.backgroundColor = '';
      loginErrorMessages.style.borderColor = '';
    }
  }
});