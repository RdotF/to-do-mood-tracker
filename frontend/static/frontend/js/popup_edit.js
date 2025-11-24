document.addEventListener("DOMContentLoaded", () => {
 const isAuthenticated = localStorage.getItem('is_authenticated');
            const userId = localStorage.getItem('user_id');
            const username = localStorage.getItem('username');

            if (!isAuthenticated || !userId) {
                // Если не авторизован, перенаправляем на главную
                window.location.href = '/';
                return;
            }

            // Показываем информацию о пользователе
            const userInfo = document.getElementById('user-info');
            userInfo.innerHTML = `
                <p><strong>ID:</strong> ${userId}</p>
                <p><strong>Имя пользователя:</strong> ${username}</p>
                <button onclick="logout()">Выйти</button>
            `;
        });

        function logout() {
            // Очищаем localStorage и перенаправляем на главную
            localStorage.removeItem('user_id');
            localStorage.removeItem('username');
            localStorage.removeItem('is_authenticated');
            window.location.href = '/';
  const openBtn = document.querySelector(".btn-change");
  const overlay = document.querySelector(".edit-overlay");
  const closeBtn = overlay ? overlay.querySelector(".close-btn") : null;

  if (!openBtn) {
    console.warn("popup_edit: openBtn ('.btn-change') не найден");
    return;
  }
  if (!overlay) {
    console.warn("popup_edit: overlay ('.edit-overlay') не найден");
    return;
  }
  if (!closeBtn) {
    console.warn("popup_edit: closeBtn не найден внутри overlay");
    return;
  }

  openBtn.addEventListener("click", () => {
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  });

  closeBtn.addEventListener("click", () => {
    overlay.classList.remove("active");
    document.body.style.overflow = "";
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.classList.remove("active");
      document.body.style.overflow = "";
    }
  });
   const logoutBtn = document.getElementById('logoutBtn');

        // Выход из аккаунта
        if (logoutBtn) {
          logoutBtn.addEventListener('click', function() {
            // Отправляем запрос на выход (если используете сессии)
            fetch('/api/logout/', {
              method: 'POST',
              headers: {
                'X-CSRFToken': getCSRFToken()
              }
            })
            .then(() => {
              // Очищаем localStorage
              localStorage.removeItem('user_id');
              localStorage.removeItem('username');
              localStorage.removeItem('is_authenticated');

              // Перенаправляем на главную
              window.location.href = '/';
            })
            .catch(error => {
              console.error('Ошибка при выходе:', error);
              // Все равно очищаем и перенаправляем
              localStorage.clear();
              window.location.href = '/';
            });
          });
        }

        // Проверяем авторизацию при загрузке страницы
        checkAuthentication();

        function checkAuthentication() {
          const urlParams = new URLSearchParams(window.location.search);
          const forceCheck = urlParams.get('check_auth');

          // Если пользователь не авторизован в localStorage, но на странице профиля
          const isAuthenticated = localStorage.getItem('is_authenticated');
          const storedUserId = localStorage.getItem('user_id');
          const currentUserId = '{{ user_id }}';

          if (!isAuthenticated || storedUserId !== currentUserId) {
            // Обновляем localStorage данными из шаблона
            localStorage.setItem('user_id', '{{ user_id }}');
            localStorage.setItem('username', '{{ username }}');
            localStorage.setItem('is_authenticated', 'true');
          }
        }

        function getCSRFToken() {
          const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
          return csrfToken ? csrfToken.value : '';
        }

        // Можно добавить загрузку дополнительных данных через API
        function loadUserStats() {
          const userId = '{{ user_id }}';
          if (userId) {
            fetch(`/api/user/${userId}/stats/`)
              .then(response => response.json())
              .then(stats => {
                // Обновляем статистику
                const statsElement = document.getElementById('userStats');
                if (statsElement && stats.data) {
                  statsElement.innerHTML = `
                    <div class="stat-item">
                      <span>Задач выполнено: ${stats.completed_tasks || 0}</span>
                    </div>
                    <div class="stat-item">
                      <span>Среднее настроение: ${stats.average_mood || 'Н/Д'}</span>
                    </div>
                  `;
                }
              })
              .catch(error => console.error('Ошибка загрузки статистики:', error));
          }
        }

        // Загружаем статистику при необходимости
        // loadUserStats();
});
