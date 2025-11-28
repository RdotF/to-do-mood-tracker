document.addEventListener("DOMContentLoaded", () => {
  const daysContainer = document.querySelector(".days");
  const monthBtn = document.querySelector(".month-btn");
  const monthSpan = document.getElementById("current-month-display");

  let currentDate = new Date();
  let currentMonth = currentDate.getMonth();
  let currentYear = currentDate.getFullYear();

  let tasks = [];
  let dailyMoods = [];
  let moods = [];
  let images = [];

  // Получаем ID пользователя
  function getUserId() {
    const userDataElement = document.getElementById('user-data');
    return userDataElement ? userDataElement.dataset.userId : null;
  }

  // Функция для получения CSRF токена
  function getCSRFToken() {
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
    return csrfToken ? csrfToken.value : '';
  }

  // Загружаем данные с сервера
  function loadData() {
    const userId = getUserId();
    if (!userId) {
      console.error('Пользователь не авторизован');
      return;
    }

    // Загружаем задачи
    fetch('/api/tasks/')
      .then(response => {
        if (!response.ok) throw new Error('Ошибка загрузки задач');
        return response.json();
      })
      .then(data => {
        tasks = data;
        renderCalendar();
      })
      .catch(error => console.error('Ошибка загрузки задач:', error));

    // Загружаем настроения
    fetch('/api/daily_mood/')
      .then(response => {
        if (!response.ok) throw new Error('Ошибка загрузки настроений');
        return response.json();
      })
      .then(data => {
        dailyMoods = data;
        renderCalendar();
      })
      .catch(error => console.error('Ошибка загрузки настроений:', error));

    // Загружаем доступные настроения
    fetch('/api/moods/')
  .then(response => {
    if (!response.ok) throw new Error('Ошибка загрузки типов настроений');
    return response.json();
  })
  .then(data => {
    moods = data;
    console.log('Загруженные настроения из API:', moods); // ДОБАВЬТЕ ЭТУ СТРОКУ
    // После загрузки настроений загружаем изображения для них
    return fetch('/api/images/');
  })
      .then(response => {
        if (!response.ok) throw new Error('Ошибка загрузки изображений');
        return response.json();
      })
      .then(data => {
        images = data;
        renderCalendar();
      })
      .catch(error => console.error('Ошибка загрузки изображений:', error));
  }

  // Получаем название месяца на русском
  function getMonthName(month) {
    const months = [
      "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
      "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
    ];
    return months[month];
  }

  // Получаем количество дней в месяце
  function getDaysInMonth(month, year) {
    return new Date(year, month + 1, 0).getDate();
  }

  // Получаем день недели первого дня месяца (0 - воскресенье, 1 - понедельник, ...)
  function getFirstDayOfMonth(month, year) {
    const firstDay = new Date(year, month, 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1;
  }

  // Форматируем дату в YYYY-MM-DD
  function formatDate(day) {
    return `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  // Получаем задачи на конкретную дату
  function getTasksForDate(date) {
    return tasks.filter(task => task.due_date === date);
  }

  // Получаем настроение на конкретную дату
  function getMoodForDate(date) {
    return dailyMoods.find(mood => mood.date === date);
  }

  // Получаем изображение для настроения
  function getMoodImage(moodId) {
    const image = images.find(img => img.mood === moodId);
    return image ? image.image_url : null;
  }

  // Сохраняем настроение
  function saveMood(date, moodId) {
    const userId = getUserId();
    if (!userId) return Promise.reject('Пользователь не авторизован');

    const existingMood = getMoodForDate(date);

    if (existingMood) {
      // Обновляем существующее настроение
      return fetch(`/api/daily_mood/${existingMood.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify({ mood: moodId })
      });
    } else {
      // Создаем новое настроение
      return fetch('/api/daily_mood/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify({
          date: date,
          mood: moodId
        })
      });
    }
  }

  // Создаем задачу
  function createTask(date, title = "") {
    const userId = getUserId();
    if (!userId) return Promise.reject('Пользователь не авторизован');

    return fetch('/api/tasks/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken()
      },
      body: JSON.stringify({
        title: title,
        due_date: date,
        user: userId
      })
    });
  }

  // Обновляем задачу
  function updateTask(taskId, updates) {
    return fetch(`/api/tasks/${taskId}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken()
      },
      body: JSON.stringify(updates)
    });
  }

  // Удаляем задачу
  function deleteTask(taskId) {
    return fetch(`/api/tasks/${taskId}/`, {
      method: 'DELETE',
      headers: {
        'X-CSRFToken': getCSRFToken()
      }
    });
  }

  // Создаем элемент задачи (аналогично todo.js)
  function createTaskItem(text = "", taskId = null, isCompleted = false, date) {
    const li = document.createElement("li");
    li.classList.add("task-item");
    if (taskId) {
      li.dataset.taskId = taskId;
    }

    const checkbox = document.createElement("div");
    checkbox.classList.add("task-bullet");
    if (isCompleted) {
      checkbox.classList.add("checked");
    }

    const span = document.createElement("span");
    span.classList.add("task-text");
    span.contentEditable = "true";
    span.textContent = text;
    if (isCompleted) {
      span.classList.add("checked");
    }

    let saveTimeout;

    function debouncedSave() {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        const title = span.textContent.trim();

        if (taskId) {
          if (title === "") {
            deleteTask(taskId)
              .then(() => {
                li.remove();
                tasks = tasks.filter(t => t.id !== taskId);
              })
              .catch(error => console.error('Ошибка удаления:', error));
          } else {
            updateTask(taskId, { title: title })
              .then(() => {
                // Обновляем локальные данные
                const task = tasks.find(t => t.id === taskId);
                if (task) task.title = title;
              })
              .catch(error => console.error('Ошибка обновления:', error));
          }
        } else if (title !== "") {
          createTask(date, title)
            .then(response => response.json())
            .then(newTask => {
              tasks.push(newTask);
              li.dataset.taskId = newTask.id;
              taskId = newTask.id;
            })
            .catch(error => {
              console.error('Ошибка сохранения:', error);
              span.style.border = '1px solid red';
              setTimeout(() => span.style.border = '', 2000);
            });
        }
      }, 1000);
    }

    // Зачеркивание при клике по буллету
    checkbox.addEventListener("click", () => {
      const wasChecked = checkbox.classList.contains("checked");
      checkbox.classList.toggle("checked");
      span.classList.toggle("checked");

      if (taskId) {
        updateTask(taskId, { is_completed: !wasChecked })
          .then(() => {
            // Обновляем локальные данные
            const task = tasks.find(t => t.id === taskId);
            if (task) task.is_completed = !wasChecked;
          })
          .catch(error => {
            console.error('Ошибка обновления статуса:', error);
            checkbox.classList.toggle("checked");
            span.classList.toggle("checked");
          });
      }
    });

    // Если текст пустой, убираем зачеркивание
    span.addEventListener("input", () => {
      debouncedSave();

      if (span.textContent.trim() === "") {
        checkbox.classList.remove("checked");
        span.classList.remove("checked");
        if (taskId) {
          updateTask(taskId, { is_completed: false })
            .then(() => {
              const task = tasks.find(t => t.id === taskId);
              if (task) task.is_completed = false;
            })
            .catch(error => console.error('Ошибка обновления статуса:', error));
        }
      }
    });

    // Новая строка по Enter
    span.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const newItem = createTaskItem("", null, false, date);
        li.after(newItem);
        newItem.querySelector(".task-text").focus();
      }

      // Удаляем строку по Backspace, если она пустая и это не последняя
      if (e.key === "Backspace" && span.textContent.trim() === "") {
        const taskItems = li.parentElement.querySelectorAll('.task-item');
        if (taskItems.length > 1) {
          if (taskId) {
            deleteTask(taskId)
              .then(() => {
                li.remove();
                tasks = tasks.filter(t => t.id !== taskId);
                const prev = li.previousElementSibling;
                if (prev) prev.querySelector(".task-text").focus();
              })
              .catch(error => console.error('Ошибка удаления:', error));
          } else {
            li.remove();
            const prev = li.previousElementSibling;
            if (prev) prev.querySelector(".task-text").focus();
          }
        } else {
          e.preventDefault();
        }
      }
    });

    span.addEventListener("blur", () => {
      clearTimeout(saveTimeout);
      debouncedSave();
    });

    li.appendChild(checkbox);
    li.appendChild(span);
    return li;
  }

  // Если список задач пуст, создаём одну пустую строку
  function ensureEmptyTaskLine(taskList, date) {
    if (taskList.children.length === 0) {
      taskList.appendChild(createTaskItem("", null, false, date));
    }
  }

  // Отображаем календарь
  function renderCalendar() {
    // Обновляем заголовок месяца
    monthSpan.textContent = getMonthName(currentMonth);

    // Очищаем контейнер дней
    daysContainer.innerHTML = '';

    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

    // Добавляем пустые ячейки для дней перед первым числом месяца
    for (let i = 0; i < firstDay; i++) {
      const emptyDay = document.createElement("div");
      emptyDay.classList.add("day-box", "empty");
      daysContainer.appendChild(emptyDay);
    }

    // Создаем ячейки для каждого дня месяца
    for (let day = 1; day <= daysInMonth; day++) {
      const date = formatDate(day);
      const dayTasks = getTasksForDate(date);
      const dayMood = getMoodForDate(date);

      const dayElement = document.createElement("div");
      dayElement.classList.add("day-box");

      const dayNumber = document.createElement("div");
      dayNumber.classList.add("day-number");
      dayNumber.textContent = day;

      const dayMoodElement = document.createElement("img");
      dayMoodElement.classList.add("day-mood");

      // Всегда показываем иконку настроения
      if (dayMood && dayMood.mood_image) {
  // Используем изображение из связанной таблицы Image
  dayMoodElement.src = dayMood.mood_image;
  dayMoodElement.alt = dayMood.mood_name || 'Настроение';
} else {
  // Показываем happy как placeholder если настроения нет
  dayMoodElement.src = '/static/frontend/images/happy.svg';
  dayMoodElement.alt = 'Выбрать настроение';
  dayMoodElement.classList.add('mood-placeholder');
}

      const dayTasksElement = document.createElement("ul");
      dayTasksElement.classList.add("day-tasks");

      // Добавляем существующие задачи
      dayTasks.forEach(task => {
        const taskElement = createTaskItem(task.title, task.id, task.is_completed, date);
        dayTasksElement.appendChild(taskElement);
      });

      // Обеспечиваем хотя бы одну пустую строку для новых задач
      ensureEmptyTaskLine(dayTasksElement, date);

      // Обработчик для выбора настроения - нажимаем на саму картинку настроения
      dayMoodElement.addEventListener("click", () => {
        showMoodSelection(day, date, dayMoodElement);
      });

      dayElement.appendChild(dayNumber);
      dayElement.appendChild(dayMoodElement);
      dayElement.appendChild(dayTasksElement);
      daysContainer.appendChild(dayElement);
    }

    // Добавляем пустые ячейки в конце месяца если нужно
    const totalCells = firstDay + daysInMonth;
    const remainingCells = 31 - totalCells; // 6 недель * 7 дней = 42 ячейки

    for (let i = 0; i < remainingCells; i++) {
      const emptyDay = document.createElement("div");
      emptyDay.classList.add("day-box", "empty");
      daysContainer.appendChild(emptyDay);
    }
  }
   const moodFiles = [
    "happy.svg", "relaxed.svg", "sad.svg", "angry.svg", "excited.svg", "bored.svg"
  ];
const moodFileMap = {
    'happy': 'happy.svg',
    'sad': 'sad.svg',
    'bored': 'bored.svg',
    'relaxed': 'relaxed.svg',
    'angry': 'angry.svg',
    'excited': 'excited.svg'
};
const moodDisplayNames = {
    'happy': 'Счастливый',
    'sad': 'Грустный',
    'bored': 'Скучающий',
    'relaxed': 'Расслабленный',
    'angry': 'Злой',
    'excited': 'Взволнованный'
};
  // Показываем выбор настроения
  function showMoodSelection(day, date, moodElement) {
    // Создаем попап для выбора настроения
    const popup = document.createElement("div");
    popup.classList.add("mood-popup");

    const moodOptionsHTML = moodFiles.map(moodFile => {
        // Находим отображаемое имя для файла
        const moodKey = Object.keys(moodFileMap).find(key => moodFileMap[key] === moodFile);
        const moodName = moodDisplayNames[moodKey];

        return `
        <div class="mood-option" data-mood-file="${moodFile}">
            <img src="/static/frontend/images/${moodFile}" alt="${moodName}">
            <span>${moodName}</span>
        </div>
        `;
    }).join('');

    popup.innerHTML = `
      <div class="mood-popup-content">
        <h3>Выберите настроение для ${day}.${currentMonth + 1}.</h3>
        <div class="mood-options">
          ${moodOptionsHTML}
        </div>
        <button class="close-popup">Закрыть</button>
      </div>
    `;

    document.body.appendChild(popup);

    // Обработчики для выбора настроения
    popup.querySelectorAll(".mood-option").forEach(option => {
        option.addEventListener("click", () => {
            const moodFile = option.dataset.moodFile;
            const moodKey = Object.keys(moodFileMap).find(key => moodFileMap[key] === moodFile);
            const moodName = moodDisplayNames[moodKey];

            console.log('MOODFILE', moodFile);
            console.log('Mood key:', moodKey);
            console.log('Mood name:', moodName);

            // Сохраняем настроение
            saveMoodWithFile(date, moodFile)
                .then(() => {
                    // Обновляем отображение настроения
                    moodElement.src = `/static/frontend/images/${moodFile}`;
                    moodElement.alt = moodName;
                    moodElement.classList.remove('mood-placeholder');

                    // Перезагружаем данные настроений
                    return fetch('/api/daily_mood/');
                })
                .then(response => response.json())
                .then(data => {
                    dailyMoods = data;
                    popup.remove();
                })
                .catch(error => {
                    console.error('Ошибка сохранения настроения:', error);
                    popup.remove();
                });
        });
    });

    // Закрытие попапа
    popup.querySelector(".close-popup").addEventListener("click", () => {
        popup.remove();
    });

    // Закрытие по клику вне попапа
    popup.addEventListener("click", (e) => {
        if (e.target === popup) {
            popup.remove();
        }
    });
}


 // Сохраняем настроение с именем файла
function saveMoodWithFile(date, moodFile) {
    const userId = getUserId();
    if (!userId) return Promise.reject('Пользователь не авторизован');

     console.log('Сохранение настроения:', date, moodFile);

    // Сопоставление файлов с названиями настроений на английском (как в базе данных)
    const moodFileToName = {
        "happy.svg": "Happy",
        "relaxed.svg": "Relaxed", // соответствует "Relaxed" в БД
        "sad.svg": "Sad",
        "angry.svg": "Angry",
        "excited.svg": "Anxious",
        "bored.svg": "Calm" // соответствует "Bored" в БД
    };

    const moodName = moodFileToName[moodFile];

    if (!moodName) {
        console.error('Настроение не найдено для файла:', moodFile);
        return Promise.reject('Настроение не найдено для файла: ' + moodFile);
    }

    console.log('Ищем настроение в базе:', moodName);

    // Ищем настроение по имени
    const mood = moods.find(m => m.name === moodName);

    if (!mood) {
        console.error('Настроение не найдено в базе данных:', moodName, 'Доступные настроения:', moods);
        return Promise.reject('Настроение "' + moodName + '" не найдено в базе данных');
    }

    console.log('Найдено настроение ID:', mood.id);

    const existingMood = getMoodForDate(date);
    console.log('Существующее настроение для даты', date, ':', existingMood);

    if (existingMood) {
        // Обновляем существующее настроение через PATCH
        console.log('Обновляем существующее настроение ID:', existingMood.id);
        return fetch(`/api/daily_mood/${existingMood.id}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify({ mood: mood.id })
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`Ошибка обновления настроения: ${response.status} - ${text}`);
                });
            }
            return response.json();
        });
    } else {
        // Создаем новое настроение через POST
        console.log('Создаем новое настроение для даты:', date);
        return fetch('/api/daily_mood/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify({
                date: date,
                mood: mood.id
            })
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`Ошибка создания настроения: ${response.status} - ${text}`);
                });
            }
            return response.json();
        });
    }
}

  // Переключение месяцев
  function setupMonthNavigation() {
    const arrows = monthBtn.querySelectorAll(".arrow");

    arrows[0].addEventListener("click", (e) => {
      e.stopPropagation();
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }
      loadData();
    });

    arrows[1].addEventListener("click", (e) => {
      e.stopPropagation();
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
      loadData();
    });
  }

  // Инициализация
  function init() {
    setupMonthNavigation();
    loadData();
  }

  // Запускаем при загрузке
  init();
});