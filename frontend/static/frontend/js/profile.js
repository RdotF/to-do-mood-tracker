document.addEventListener('DOMContentLoaded', function() {
    // Элементы для обновления данных
    const usernameDisplay = document.getElementById('usernameDisplay');
    const emailDisplay = document.getElementById('emailDisplay');
    const userIdDisplay = document.getElementById('userIdDisplay');
    const logoutBtn = document.getElementById('logoutBtn');
    const userStats = document.getElementById('userStats');

    // Функция для получения данных пользователя из data-атрибутов
    function getUserData() {
        const userDataElement = document.getElementById('user-data');
        if (!userDataElement) {
            console.error('Элемент с данными пользователя не найден');
            return {};
        }

        return {
            username: userDataElement.dataset.username || '',
            email: userDataElement.dataset.email || '',
            userId: userDataElement.dataset.userId || ''
        };
    }

    // Функция для обновления данных пользователя
    function updateUserData() {
        // Получаем данные из data-атрибутов
        const userData = getUserData();
        const username = userData.username;
        const email = userData.email;
        const userId = userData.userId;

        console.log('Данные пользователя:', userData);

        // Обновляем отображение только если данные есть
        if (username && username !== 'логин' && usernameDisplay) {
            usernameDisplay.textContent = username;
        }

        if (email && email !== 'почта' && emailDisplay) {
            emailDisplay.textContent = email;
        }

        if (userId && userIdDisplay) {
            userIdDisplay.textContent = `ID: ${userId}`;
        }

        // Также обновляем localStorage для согласованности
        if (userId) {
            localStorage.setItem('user_id', userId);
            localStorage.setItem('username', username);
            localStorage.setItem('email', email);
            localStorage.setItem('is_authenticated', 'true');
        }

        // Обновляем title страницы
        if (username && username !== 'логин') {
            document.title = `Личный кабинет - ${username}`;
        }
    }

    // Функция для загрузки статистики пользователя
    function loadUserStats() {
        const userData = getUserData();
        const userId = userData.userId;

        if (!userId) {
            console.log('ID пользователя не найден для загрузки статистики');
            return;
        }

        // Временная заглушка для статистики
        if (userStats) {
            userStats.innerHTML = `
                <div class="stat-item">
                    <span>Задач выполнено: 0</span>
                </div>
                <div class="stat-item">
                    <span>Среднее настроение: Н/Д</span>
                </div>
                <div class="stat-item">
                    <span>Активных задач: 0</span>
                </div>
                <div class="stat-note">
                    <p><small>Статистика появится после использования приложения</small></p>
                </div>
            `;
        }

        // Раскомментируйте когда будет API для статистики:
        /*
        fetch(`/api/user/${userId}/stats/`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Статистика недоступна');
                }
                return response.json();
            })
            .then(stats => {
                if (userStats && stats.data) {
                    userStats.innerHTML = `
                        <div class="stat-item">
                            <span>Задач выполнено: ${stats.completed_tasks || 0}</span>
                        </div>
                        <div class="stat-item">
                            <span>Среднее настроение: ${stats.average_mood || 'Н/Д'}</span>
                        </div>
                        <div class="stat-item">
                            <span>Активных задач: ${stats.active_tasks || 0}</span>
                        </div>
                    `;
                }
            })
            .catch(error => {
                console.log('Статистика пока недоступна');
                if (userStats) {
                    userStats.innerHTML = `
                        <div class="stat-placeholder">
                            <p>Статистика появится после использования приложения</p>
                        </div>
                    `;
                }
            });
        */
    }

    // Функция для выхода
    function setupLogout() {
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                if (confirm('Вы уверены, что хотите выйти?')) {
                    // Отправляем запрос на выход
                    fetch('/api/logout/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': getCSRFToken()
                        }
                    })
                    .then(response => {
                        if (response.ok) {
                            // Очищаем localStorage
                            localStorage.removeItem('user_id');
                            localStorage.removeItem('username');
                            localStorage.removeItem('email');
                            localStorage.removeItem('is_authenticated');

                            // Перенаправляем на главную
                            window.location.href = '/';
                        } else {
                            throw new Error('Ошибка сервера при выходе');
                        }
                    })
                    .catch(error => {
                        console.error('Ошибка при выходе:', error);
                        // Все равно очищаем и перенаправляем
                        localStorage.clear();
                        window.location.href = '/';
                    });
                }
            });
        }
    }

    // Функция для получения CSRF токена
    function getCSRFToken() {
    // Способ 1: Из формы с csrfmiddlewaretoken
    let csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
    if (csrfToken) {
        return csrfToken.value;
    }

    // Способ 2: Из cookies
    const name = 'csrftoken';
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }

    if (cookieValue) {
        console.log('CSRF токен найден в cookies:', cookieValue);
        return cookieValue;
    }

    console.error('CSRF токен не найден');
    return '';
}

    // Функция для проверки авторизации
    function checkAuthentication() {
        const userData = getUserData();
        const sessionUserId = userData.userId;
        const storedUserId = localStorage.getItem('user_id');

        // Если в localStorage нет данных, но в сессии есть - синхронизируем
        if ((!localStorage.getItem('is_authenticated') || !storedUserId) && sessionUserId) {
            localStorage.setItem('user_id', sessionUserId);
            localStorage.setItem('username', userData.username);
            localStorage.setItem('email', userData.email);
            localStorage.setItem('is_authenticated', 'true');
        }

        // Если данные в localStorage и сессии не совпадают - обновляем localStorage
        if (storedUserId !== sessionUserId && sessionUserId) {
            localStorage.setItem('user_id', sessionUserId);
            localStorage.setItem('username', userData.username);
            localStorage.setItem('email', userData.email);
        }

        // Если пользователь не авторизован - перенаправляем
        if (!sessionUserId && !storedUserId) {
            console.warn('Пользователь не авторизован');
            // window.location.href = '/'; // Раскомментируйте если нужно автоматическое перенаправление
        }
    }

    // Инициализация
    function init() {
        console.log('Инициализация профиля...');
        updateUserData();
        checkAuthentication();
        setupLogout();
        loadUserStats();
    }

    // Запускаем инициализацию
    init();
});

