document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("todo-list");

  function createTodoItem() {
    const li = document.createElement("li");
    li.classList.add("todo-item");

    const checkbox = document.createElement("div");
    checkbox.classList.add("todo-checkbox");

    const span = document.createElement("span");
    span.classList.add("todo-text");
    span.contentEditable = "true";
    span.textContent = "";

    // Зачеркивание при клике по буллету
    checkbox.addEventListener("click", () => {
      checkbox.classList.toggle("checked");
      span.classList.toggle("checked");
    });

    // Новая строка по Enter
    span.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const newItem = createTodoItem();
        li.after(newItem);
        newItem.querySelector(".todo-text").focus();
      }
      // Удаляем строку по Backspace, если она пустая и это не последняя
      if (e.key === "Backspace" && span.textContent.trim() === "") {
        if (list.children.length > 1) {
          li.remove();
          // Перемещаем фокус на предыдущую строку
          const prev = li.previousElementSibling;
          if (prev) prev.querySelector(".todo-text").focus();
        } else {
          e.preventDefault(); // последняя строка не удаляется
        }
      }
    });

    // Если текст пустой, убираем зачеркивание
    span.addEventListener("input", () => {
      if (span.textContent.trim() === "") {
        checkbox.classList.remove("checked");
        span.classList.remove("checked");
      }
    });

    li.appendChild(checkbox);
    li.appendChild(span);
    return li;
  }

  // Если список пуст, создаём одну пустую строку
  function ensureEmptyLine() {
    if (list.children.length === 0) {
      list.appendChild(createTodoItem());
    }
  }

  // Инициализация
  ensureEmptyLine();
});
