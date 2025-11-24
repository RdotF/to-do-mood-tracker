document.addEventListener("DOMContentLoaded", () => {
  const moodButtons = document.querySelectorAll(".mood-btn");
  const moodPlaceholder = document.querySelector(".mood-placeholder");
  const moodImage = document.getElementById("mood-image");

  const moods = {
    happy: { image: "/static/frontend/images/mood_happy_img.svg", quote: "Улыбка — лучший наряд дня!" },
    excited: { image: "/static/frontend/images/mood_excited_img.svg", quote: "Энергия внутри тебя — делай великие вещи!" },
    calm: { image: "/static/frontend/images/mood_calm_img.svg", quote: "Покой — это сила, а не слабость." },
    anxious: { image: "/static/frontend/images/mood_anxious_img.svg", quote: "Ты справишься, просто дыши глубже." },
    angry: { image: "/static/frontend/images/mood_angry_img.svg", quote: "Остановись. Подумай. Не давай злости управлять тобой." },
    sad: { image: "/static/frontend/images/mood_sad_img.svg", quote: "Иногда грусть — тоже способ исцеления." },
  };

  const today = new Date().toISOString().split('T')[0]; // Получаем сегодняшнюю дату в формате YYYY-MM-DD

  async function checkExistingMood() {
    const response = await fetch(`/api/daily_mood/?date=${today}`, { method: 'GET' });

    if (!response.ok) throw new Error('Ошибка при получении данных о настроении.');

    return response.json();
  }

  async function saveMood(moodKey) {
    const moodData = moods[moodKey];

    try {
      const existingMood = await checkExistingMood();

      if (existingMood.length > 0) {
        const moodId = existingMood[0].id;

        const updateResponse = await fetch(`/api/daily_mood/${moodId}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mood: moodKey }),
        });

        if (!updateResponse.ok) throw new Error('Ошибка при обновлении настроения.');
      } else {
        const createResponse = await fetch('/api/daily_mood/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: today, mood: moodKey }),
        });

        if (!createResponse.ok) throw new Error('Ошибка при создании настроения.');
      }
    } catch (error) {
      console.error(error);
    }
  }

  moodButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const moodKey = btn.alt.toLowerCase();
      const moodData = moods[moodKey];
       console.log(moodKey)
      if (moodData) {
        moodPlaceholder.classList.add("hidden");
        moodImage.src = moodData.image;
        moodImage.alt = moodKey;
        moodImage.classList.remove("hidden");

        let quoteEl = document.querySelector(".mood-quote");
        if (!quoteEl) {
          quoteEl = document.createElement("p");
          quoteEl.classList.add("mood-quote");
          document.querySelector(".mood-inner").appendChild(quoteEl);
        }
        quoteEl.textContent = moodData.quote;
        moodKey = option.dataset.moodFile
        saveMood(moodKey);
      }
    });
  });
});