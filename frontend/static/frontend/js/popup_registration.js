document.addEventListener("DOMContentLoaded", () => {
  const openBtn = document.getElementById("openRegistration");
  const overlay = document.querySelector(".overlay");
  const closeBtn = document.querySelector(".close-btn");
  const registrationForm = document.getElementById('registrationForm');
  const errorMessages = document.getElementById('errorMessages');

  if (!openBtn || !overlay || !closeBtn || !registrationForm) {
    console.error("Не найден один из элементов:", { openBtn, overlay, closeBtn, registrationForm });
    return;
  }

  // открыть popup
  openBtn.addEventListener("click", () => {
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  });

  // закрыть popup по крестику
  closeBtn.addEventListener("click", closePopup);

  // закрыть popup по клику вне окна
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      closePopup();
    }
  });

  function closePopup() {
    overlay.classList.remove("active");
    document.body.style.overflow = "";
    resetForm();
  }

  function resetForm() {
    registrationForm.reset();
    if (errorMessages) {
      errorMessages.style.display = 'none';
      errorMessages.innerHTML = '';
    }
  }

  // Обработка отправки формы
  registrationForm.addEventListener('submit', function(e) {
    e.preventDefault();

    // Скрываем предыдущие ошибки
    if (errorMessages) {
      errorMessages.style.display = 'none';
      errorMessages.innerHTML = '';
    }

    // Собираем данные формы
    const formData = new FormData(registrationForm);
    const data = {
      username: formData.get('username'),
      email: formData.get('email'),
      password: formData.get('password')
    };

    // Валидация на клиенте
    if (!data.username || !data.email || !data.password) {
      showErrors({ non_field_errors: ['Пожалуйста, заполните все поля'] });
      return;
    }

    // Отправляем запрос на сервер
    fetch('/api/register/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken()
      },
      body: JSON.stringify(data)
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => { throw err; });
      }
      return response.json();
    })
    .then(data => {
      // Успешная регистрация
      console.log('Регистрация успешна:', data);
      showSuccess('Регистрация прошла успешно!');

      // Закрываем попап через задержку
      setTimeout(() => {
        closePopup();
        // Можно перенаправить на страницу входа или другую страницу
        // window.location.href = '/login/';
      }, 1500);
    })
    .catch(error => {
      // Обработка ошибок
      console.error('Ошибка регистрации:', error);
      showErrors(error);
    });
  });

  function getCSRFToken() {
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
    return csrfToken ? csrfToken.value : '';
  }

  function showErrors(errors) {
    if (!errorMessages) return;

    errorMessages.innerHTML = '';
    errorMessages.style.backgroundColor = '#ffe6e6';
    errorMessages.style.borderColor = '#ff9999';

    if (typeof errors === 'object') {
      for (const field in errors) {
        const fieldErrors = errors[field];
        if (Array.isArray(fieldErrors)) {
          fieldErrors.forEach(error => {
            const errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            // Красивые названия полей
            const fieldName = getFieldDisplayName(field);
            errorElement.textContent = `${fieldName}: ${error}`;
            errorMessages.appendChild(errorElement);
          });
        } else {
          const errorElement = document.createElement('div');
          errorElement.className = 'error-message';
          errorElement.textContent = fieldErrors;
          errorMessages.appendChild(errorElement);
        }
      }
    } else {
      const errorElement = document.createElement('div');
      errorElement.className = 'error-message';
      errorElement.textContent = 'Произошла ошибка при регистрации';
      errorMessages.appendChild(errorElement);
    }

    errorMessages.style.display = 'block';
  }

  function showSuccess(message) {
    if (!errorMessages) return;

    errorMessages.innerHTML = `
      <div class="success-message">${message}</div>
    `;
    errorMessages.style.display = 'block';
    errorMessages.style.backgroundColor = '#e6ffe6';
    errorMessages.style.borderColor = '#99ff99';
  }

  function getFieldDisplayName(field) {
    const fieldNames = {
      'username': 'Логин',
      'email': 'Email',
      'password': 'Пароль',
      'non_field_errors': 'Ошибка'
    };
    return fieldNames[field] || field;
  }
});