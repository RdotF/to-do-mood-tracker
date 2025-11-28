document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("todo-list");
  const currentDayElement = document.getElementById("currentDay");
  const currentDateElement = document.getElementById("currentDate");

  // Получаем ID пользователя
  function getUserId() {
    const userDataElement = document.getElementById('user-data');
    return userDataElement ? userDataElement.dataset.userId : null;
  }

  // Устанавливаем текущую дату
  function setCurrentDate() {
    const now = new Date();

    const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    const dayName = days[now.getDay()];

    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const formattedDate = `${day}.${month}`;

    currentDayElement.textContent = dayName;
    currentDateElement.textContent = formattedDate;

    return {
      dayName,
      formattedDate,
      isoDate: now.toISOString().split('T')[0]
    };
  }

  const currentDate = setCurrentDate();

  // Загружаем задачи с сервера
  function loadTasks() {
    const userId = getUserId();
    if (!userId) {
      console.error('Пользователь не авторизован');
      return;
    }

    fetch('/api/tasks/')  //
      .then(response => {
        if (!response.ok) {
          if (response.status === 401) {
            console.error('Пользователь не авторизован');
            return;
          }
          throw new Error('Ошибка загрузки задач');
        }
        return response.json();
      })
      .then(tasks => {
        console.log('Загруженные задачи:', tasks); // Для отладки

        // Фильтруем задачи по текущей дате
        const todayTasks = tasks.filter(task => task.due_date === currentDate.isoDate);
        console.log('Задачи на сегодня:', todayTasks); // Для отладки

        list.innerHTML = '';

        if (todayTasks.length > 0) {
          todayTasks.forEach(task => {
            const li = createTodoItem(task.title, task.id, task.is_completed);
            list.appendChild(li);
          });
        }

        ensureEmptyLine();
      })
      .catch(error => {
        console.error('Ошибка загрузки задач:', error);
        ensureEmptyLine();
      });
  }

  // Сохраняем задачу на сервер
  // Сохраняем задачу на сервер
function saveTask(title, isCompleted = false) {
  const userId = getUserId();
  if (!userId) {
    console.error('Пользователь не авторизован');
    return Promise.reject('Пользователь не авторизован');
  }

  const taskData = {
    title: title,
    due_date: currentDate.isoDate,
    is_completed: isCompleted
  };

  console.log('Отправляемые данные задачи:', taskData); // 👈 ДЛЯ ОТЛАДКИ

  return fetch('/api/tasks/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken()
    },
    body: JSON.stringify(taskData)
  })
  .then(response => {
    if (!response.ok) {
      return response.json().then(err => {
        console.error('Ошибка от сервера:', err); // 👈 ДЛЯ ОТЛАДКИ
        throw new Error(err.error || JSON.stringify(err) || 'Ошибка сохранения');
      });
    }
    return response.json();
  })
  .then(data => {
    console.log('Задача сохранена:', data);
    return data;
  })
  .catch(error => {
    console.error('Ошибка сети:', error);
    throw error;
  });
}

  // Обновляем задачу на сервере
  function updateTask(taskId, updates) {
    return fetch(`/api/tasks/${taskId}/`, {  // 👈 Убедитесь что URL правильный
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken()
      },
      body: JSON.stringify(updates)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Ошибка обновления задачи');
      }
      return response.json();
    });
  }

  // Удаляем задачу с сервера
  function deleteTask(taskId) {
    return fetch(`/api/tasks/${taskId}/`, {  // 👈 Убедитесь что URL правильный
      method: 'DELETE',
      headers: {
        'X-CSRFToken': getCSRFToken()
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Ошибка удаления задачи');
      }
    });
  }

  function createTodoItem(text = "", taskId = null, isCompleted = false) {
    const li = document.createElement("li");
    li.classList.add("todo-item");
    if (taskId) {
      li.dataset.taskId = taskId;
    }

    const checkbox = document.createElement("div");
    checkbox.classList.add("todo-checkbox");
    if (isCompleted) {
      checkbox.classList.add("checked");
    }

    const span = document.createElement("span");
    span.classList.add("todo-text");
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
                ensureEmptyLine();
              })
              .catch(error => console.error('Ошибка удаления:', error));
          } else {
            updateTask(taskId, { title: title })
              .catch(error => console.error('Ошибка обновления:', error));
          }
        } else if (title !== "") {
          saveTask(title)
            .then(newTask => {
              li.dataset.taskId = newTask.id;
              taskId = newTask.id;
              console.log('Новая задача создана с ID:', newTask.id); // Для отладки
            })
            .catch(error => {
              console.error('Ошибка сохранения:', error);
              // Показываем пользователю ошибку
              span.style.border = '1px solid red';
              setTimeout(() => span.style.border = '', 2000);
            });
        }
      }, 1000);
    }

    checkbox.addEventListener("click", () => {
      const wasChecked = checkbox.classList.contains("checked");
      checkbox.classList.toggle("checked");
      span.classList.toggle("checked");

      if (taskId) {
        updateTask(taskId, { is_completed: !wasChecked })
          .catch(error => {
            console.error('Ошибка обновления статуса:', error);
            checkbox.classList.toggle("checked");
            span.classList.toggle("checked");
          });
      }
    });

    span.addEventListener("input", () => {
      debouncedSave();

      if (span.textContent.trim() === "") {
        checkbox.classList.remove("checked");
        span.classList.remove("checked");
        if (taskId) {
          updateTask(taskId, { is_completed: false })
            .catch(error => console.error('Ошибка обновления статуса:', error));
        }
      }
    });

    span.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const newItem = createTodoItem();
        li.after(newItem);
        newItem.querySelector(".todo-text").focus();
      }

      if (e.key === "Backspace" && span.textContent.trim() === "") {
        if (list.children.length > 1) {
          if (taskId) {
            deleteTask(taskId)
              .then(() => {
                li.remove();
                const prev = li.previousElementSibling;
                if (prev) prev.querySelector(".todo-text").focus();
              })
              .catch(error => console.error('Ошибка удаления:', error));
          } else {
            li.remove();
            const prev = li.previousElementSibling;
            if (prev) prev.querySelector(".todo-text").focus();
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

  function ensureEmptyLine() {
    const items = list.querySelectorAll('li');
    const hasEmpty = Array.from(items).some(item => {
      const text = item.querySelector('.todo-text');
      return text && text.textContent.trim() === '';
    });

    if (!hasEmpty) {
      list.appendChild(createTodoItem());
    }
  }

  function getCSRFToken() {
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
    return csrfToken ? csrfToken.value : '';
  }

  // Инициализация
  loadTasks();
});