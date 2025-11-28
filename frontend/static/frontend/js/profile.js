document.addEventListener('DOMContentLoaded', function() {
    // Элементы для обновления данных
    const usernameDisplay = document.getElementById('usernameDisplay');
    const emailDisplay = document.getElementById('emailDisplay');
    const userIdDisplay = document.getElementById('userIdDisplay');
    const logoutBtn = document.getElementById('logoutBtn');
    const userStats = document.getElementById('userStats');

    // Элемент аватарки (только для отображения)
    const userAvatar = document.getElementById('user-avatar');

    // Элементы для попапа редактирования
    const editBtn = document.querySelector('.btn-change');
    const editOverlay = document.querySelector('.edit-overlay');

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
            userId: userDataElement.dataset.userId || '',
            avatarUrl: userDataElement.dataset.avatarUrl || ''
        };
    }

    // Функция для получения CSRF токена
    function getCSRFToken() {
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
        return csrfToken ? csrfToken.value : '';
    }

    // Функция для загрузки актуальных данных пользователя с сервера
    async function loadUserProfile() {
        try {
            const response = await fetch('/api/user/profile/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken()
                }
            });

            if (response.ok) {
                const userData = await response.json();
                console.log('Данные пользователя с сервера:', userData);

                // Обновляем отображение
                updateUserDisplay(userData);

                // Обновляем localStorage
                if (userData.id) {
                    localStorage.setItem('user_id', userData.id);
                    localStorage.setItem('username', userData.username);
                    localStorage.setItem('email', userData.email);
                    localStorage.setItem('avatar_url', userData.avatar_url || '');
                }

                return userData;
            } else {
                console.error('Ошибка загрузки профиля:', response.status);
                // Если API недоступно, используем данные из data-атрибутов
                updateUserData();
            }
        } catch (error) {
            console.error('Ошибка загрузки профиля:', error);
            // Если произошла ошибка, используем данные из data-атрибутов
            updateUserData();
        }
    }

    // Функция для обновления отображения данных пользователя
    function updateUserDisplay(userData) {
        const username = userData.username;
        const email = userData.email;
        const userId = userData.id;
        const avatarUrl = userData.avatar_url;


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

        // Обновляем аватарку если есть
        if (userAvatar) {
            if (avatarUrl) {
                console.log('Устанавливаем аватарку:', avatarUrl);
                userAvatar.src = avatarUrl;
                userAvatar.alt = `Аватар ${username}`;
            } else {

                userAvatar.src = '/static/frontend/images/themesdark.svg';
                userAvatar.alt = 'Аватар по умолчанию';
            }

            // Добавляем обработчик ошибок загрузки изображения
            userAvatar.onerror = function() {
                console.error('Ошибка загрузки аватарки:', this.src);
                this.src = '/static/frontend/images/themesdark.svg';
            };
        }

        // Обновляем title страницы
        if (username && username !== 'логин') {
            document.title = `Личный кабинет - ${username}`;
        }
    }

    // Функция для обновления данных пользователя (из data-атрибутов)
    function updateUserData() {
        // Получаем данные из data-атрибутов
        const userData = getUserData();
        updateUserDisplay(userData);

        // Также обновляем localStorage для согласованности
        if (userData.userId) {
            localStorage.setItem('user_id', userData.userId);
            localStorage.setItem('username', userData.username);
            localStorage.setItem('email', userData.email);
            localStorage.setItem('avatar_url', userData.avatarUrl);
            localStorage.setItem('is_authenticated', 'true');
        }
    }

    // Функция для загрузки статистики пользователя
//    /*function loadUserStats() {
//        const userData = getUserData();
//        const userId = userData.userId;
//
//        if (!userId) {
//            console.log('ID пользователя не найден для загрузки статистики');
//            return;
//        }
//
//        // Временная заглушка для статистики
//        if (userStats) {
//            userStats.innerHTML = `
//                <div class="stat-item">
//                    <span>Задач выполнено: 0</span>
//                </div>
//                <div class="stat-item">
//                    <span>Среднее настроение: Н/Д</span>
//                </div>
//                <div class="stat-item">
//                    <span>Активных задач: 0</span>
//                </div>
//                <div class="stat-note">
//                    <p><small>Статистика появится после использования приложения</small></p>
//                </div>
//            `;
//        }
//    }*/

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
                            localStorage.removeItem('avatar_url');
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
            localStorage.setItem('avatar_url', userData.avatarUrl);
            localStorage.setItem('is_authenticated', 'true');
        }

        // Если данные в localStorage и сессии не совпадают - обновляем localStorage
        if (storedUserId !== sessionUserId && sessionUserId) {
            localStorage.setItem('user_id', sessionUserId);
            localStorage.setItem('username', userData.username);
            localStorage.setItem('email', userData.email);
            localStorage.setItem('avatar_url', userData.avatarUrl);
        }

        // Если пользователь не авторизован - перенаправляем
        if (!sessionUserId && !storedUserId) {
            console.warn('Пользователь не авторизован');
            // window.location.href = '/'; // Раскомментируйте если нужно автоматическое перенаправление
        }
    }

    // Настройка попапа редактирования (только открытие)
    function setupEditPopup() {
        if (!editBtn) {
            console.warn("Кнопка редактирования не найдена");
            return;
        }
        if (!editOverlay) {
            console.warn("Оверлей попапа не найден");
            return;
        }

        // Открытие попапа
        editBtn.addEventListener('click', () => {
            console.log('Открытие попапа редактирования');
            editOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    // Инициализация
    function init() {
        console.log('Инициализация профиля...');
        checkAuthentication();
        setupLogout();
        //loadUserStats();
        setupEditPopup();

        // Загружаем актуальные данные с сервера
        loadUserProfile().then(userData => {
            console.log('Профиль успешно загружен:', userData);
        }).catch(error => {
            console.error('Ошибка загрузки профиля:', error);
            // Если API недоступно, используем данные из data-атрибутов
            updateUserData();
        });
    }

    // Запускаем инициализацию
    init();
});