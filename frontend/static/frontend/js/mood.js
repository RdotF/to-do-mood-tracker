document.addEventListener("DOMContentLoaded", () => {
  const moodButtons = document.querySelectorAll(".mood-btn");
  const moodPlaceholder = document.querySelector(".mood-placeholder");
  const moodImage = document.getElementById("mood-image");

  // заранее определим словарь: какая кнопка = какая картинка и цитата
  const moods = {
    happy: {
      image: "/static/frontend/images/mood_happy_img.svg", // заменишь позже на реальные пути
      quote: "Улыбка — лучший наряд дня!",
    },
    excited: {
      image: "/static/frontend/images/mood_excited_img.svg",
      quote: "Энергия внутри тебя — делай великие вещи!",
    },
    calm: {
      image: "/static/frontend/images/mood_calm_img.svg",
      quote: "Покой — это сила, а не слабость.",
    },
    anxious: {
      image: "/static/frontend/images/mood_anxious_img.svg",
      quote: "Ты справишься, просто дыши глубже.",
    },
    angry: {
      image: "/static/frontend/images/mood_angry_img.svg",
      quote: "Остановись. Подумай. Не давай злости управлять тобой.",
    },
    sad: {
      image: "/static/frontend/images/mood_sad_img.svg",
      quote: "Иногда грусть — тоже способ исцеления.",
    },
  };

  // навешиваем обработчик на каждую кнопку
  moodButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // определяем, какая эмоция выбрана по alt
      const moodKey = btn.alt.toLowerCase();

      // получаем данные из словаря
      const moodData = moods[moodKey];

      if (moodData) {
        // скрываем текст-заглушку
        moodPlaceholder.classList.add("hidden");

        // показываем картинку и обновляем её
        moodImage.src = moodData.image;
        moodImage.alt = moodKey;
        moodImage.classList.remove("hidden");

        // создаём (или обновляем) цитату под картинкой
        let quoteEl = document.querySelector(".mood-quote");
        if (!quoteEl) {
          quoteEl = document.createElement("p");
          quoteEl.classList.add("mood-quote");
          document.querySelector(".mood-inner").appendChild(quoteEl);
        }

        quoteEl.textContent = moodData.quote;
      }
    });
  });
});
