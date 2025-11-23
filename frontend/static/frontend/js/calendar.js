document.addEventListener("DOMContentLoaded", () => {
  const daysContainer = document.querySelector(".days");
  const monthDays = 31; // пример для октября
  const moods = [
    "happy.svg",
    "calm.svg",
    "sad.svg",
    "angry.svg",
    "excited.svg",
    "anxious.svg",
  ];

  for (let i = 1; i <= monthDays; i++) {
    const day = document.createElement("div");
    day.classList.add("day-box");

    const dayNumber = document.createElement("div");
    dayNumber.classList.add("day-number");
    dayNumber.textContent = i;

    const dayMood = document.createElement("img");
    dayMood.classList.add("day-mood");
    dayMood.src = `/static/frontend/images/${
      moods[Math.floor(Math.random() * moods.length)]
    }`;

    const dayTasks = document.createElement("ul");
    dayTasks.classList.add("day-tasks");

    // добавление новой задачи по Enter
    function addTask(text = "") {
      const li = document.createElement("li");
      const bullet = document.createElement("div");
      bullet.classList.add("task-bullet");
      const span = document.createElement("span");
      span.classList.add("task-text");
      span.contentEditable = true;
      span.textContent = text;

      bullet.addEventListener("click", () => {
        bullet.classList.toggle("checked");
        span.classList.toggle("checked");
      });

      span.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          addTask();
          li.nextSibling.querySelector(".task-text").focus();
        } else if (e.key === "Backspace" && span.textContent === "") {
          e.preventDefault();
          li.remove();
        }
      });

      li.appendChild(bullet);
      li.appendChild(span);
      dayTasks.appendChild(li);
    }

    day.appendChild(dayNumber);
    day.appendChild(dayMood);
    day.appendChild(dayTasks);
    daysContainer.appendChild(day);

    // можно сразу добавить пустую задачу
    addTask();
  }
});
