document.addEventListener("DOMContentLoaded", () => {
    // Элементы попапа
    const openBtn = document.querySelector(".btn-change");
    const overlay = document.querySelector(".edit-overlay");
    const closeBtn = overlay ? overlay.querySelector(".close-btn") : null;
    const popupAvatar = document.getElementById("popup-avatar");

    // Создаем динамически input для выбора файла
    function createAvatarInput() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/jpeg,image/png,image/gif,image/webp';
        input.style.display = 'none';
        input.id = 'avatar-input-popup';
        document.body.appendChild(input);
        return input;
    }

    let avatarInput = createAvatarInput();

    // Функция для получения CSRF токена
    function getCSRFToken() {
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
        return csrfToken ? csrfToken.value : '';
    }

    // Функция для загрузки аватарки
    async function uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);

    try {
        const response = await fetch('/api/user/profile/', {
            method: 'PATCH',
            headers: {
                'X-CSRFToken': getCSRFToken(),
            },
            body: formData
        });

        if (!response.ok) {
            // Если ответ не OK, пробуем получить текст ошибки
            const errorText = await response.text();
            console.error('Ошибка сервера:', errorText);

            // Пытаемся разобрать как JSON, если это возможно
            try {
                const errorJson = JSON.parse(errorText);
                throw new Error(errorJson.detail || errorJson.message || 'Ошибка загрузки аватарки');
            } catch (e) {
                // Если не JSON, используем текст как есть
                throw new Error(errorText || 'Ошибка загрузки аватарки');
            }
        }

        const userData = await response.json();
        return userData;
    } catch (error) {
        console.error('Ошибка загрузки аватарки:', error);
        throw error;
    }
}

    // Функция для обновления отображения аватарки в попапе
    function updatePopupAvatar(avatarUrl) {
        if (!popupAvatar) {
            console.warn("popupAvatar не найден");
            return;
        }

        if (avatarUrl) {
            // Если есть URL аватарки, заменяем placeholder на изображение
            popupAvatar.innerHTML = '';
            const img = document.createElement('img');
            img.src = avatarUrl;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '50%';
            popupAvatar.appendChild(img);
        } else {
            // Если нет аватарки, показываем placeholder
            popupAvatar.innerHTML = '<span>Нажмите чтобы изменить фото</span>';
        }
    }

    // Загрузка текущей аватарки в попап
    function loadCurrentAvatarToPopup() {
        const currentAvatarUrl = localStorage.getItem('avatar_url');
        console.log('Загружаем аватарку в попап:', currentAvatarUrl);
        updatePopupAvatar(currentAvatarUrl);
    }

    // Настройка обработчиков для аватарки в попапе
    function setupPopupAvatarHandlers() {
        if (!popupAvatar) {
            console.warn("Аватар в попапе не найден");
            return;
        }

        console.log("Настройка обработчиков для аватарки в попапе");

        // Обработчик выбора файла
        avatarInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                console.log("Файл выбран:", file.name);

                // Проверка типа файла
                const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
                if (!validTypes.includes(file.type)) {
                    alert('Пожалуйста, выберите файл изображения (JPEG, PNG, GIF или WebP)');
                    return;
                }

                // Проверка размера файла (5MB)
                if (file.size > 5 * 1024 * 1024) {
                    alert('Размер файла не должен превышать 5MB');
                    return;
                }

                uploadAvatar(file)
                    .then(userData => {
                        console.log("Аватарка загружена:", userData.avatar_url);

                        // Обновляем аватарку в попапе
                        updatePopupAvatar(userData.avatar_url);

                        // Обновляем аватарку на главной странице
                        const mainAvatar = document.getElementById('user-avatar');
                        if (mainAvatar && userData.avatar_url) {
                            mainAvatar.src = userData.avatar_url;
                        }

                        // Обновляем данные в localStorage
                        if (userData.avatar_url) {
                            localStorage.setItem('avatar_url', userData.avatar_url);
                        }

                        //alert('Аватарка успешно обновлена!');

                        // Сбрасываем input
                        avatarInput.value = '';
                    })
                    .catch(error => {
                        console.error("Ошибка загрузки:", error);
                        alert('Ошибка: ' + error.message);
                        // Сбрасываем input при ошибке
                        avatarInput.value = '';
                    });
            }
        });

        // Обработчик клика по аватарке в попапе
        popupAvatar.addEventListener('click', function() {
            console.log("Клик по аватарке в попапе");
            avatarInput.click();
        });

        // Добавляем стиль курсора для интерактивности
        popupAvatar.style.cursor = 'pointer';
        popupAvatar.title = 'Нажмите для смены фото';
    }

    // Управление попапом
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
    if (!popupAvatar) {
        console.warn("popup_edit: popupAvatar не найден");
        return;
    }

    console.log("Все элементы попапа найдены");

    // Открытие попапа
    openBtn.addEventListener("click", () => {
        console.log("Открытие попапа");
        overlay.classList.add("active");
        document.body.style.overflow = "hidden";
        // Загружаем текущую аватарку при открытии попапа
        loadCurrentAvatarToPopup();
    });

    // Закрытие попапа
    closeBtn.addEventListener("click", () => {
        console.log("Закрытие попапа");
        overlay.classList.remove("active");
        document.body.style.overflow = "";
    });

    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
            overlay.classList.remove("active");
            document.body.style.overflow = "";
        }
    });

    // Закрытие попапа по ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Инициализация обработчиков аватарки в попапе
    setupPopupAvatarHandlers();
    console.log("Обработчики аватарки установлены");
});