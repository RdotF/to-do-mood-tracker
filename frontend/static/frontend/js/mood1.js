document.addEventListener('DOMContentLoaded', () => {
  const moodButtonsContainer = document.querySelector('.mood-buttons');
  const moodPlaceholder = document.querySelector('.mood-placeholder');
  const moodImage = document.getElementById('mood-image');
  const currentDayElement = document.getElementById('currentDay');
  const currentDateElement = document.getElementById('currentDate');

  const moodData = {
    happy:   { images: ['happyBunny.svg',   'happyCat.svg'],   quote: 'Улыбка — лучший наряд дня!' },
    excited: { images: ['excitedBunny.svg', 'excitedCat.svg'], quote: 'Энергия внутри тебя — делай великие вещи!' },
    relaxed: { images: ['relaxedBunny.svg',    'relaxedCat.svg'],    quote: 'Покой — это сила, а не слабость.' },
    bored:   { images: ['boredBunny.svg',   'boredCat.svg'],   quote: 'Скука - повод найти новое увлечение!' },
    angry:   { images: ['angryBunny.svg',   'angryCat.svg'],   quote: 'Остановись. Подумай. Не давай злости управлять тобой.' },
    sad:     { images: ['sadBunny.svg',     'sadCat.svg'],     quote: 'Иногда грусть — тоже способ исцеления.' }
  };

  // Если в разметке alt не совпадает с ключом (Calm/Anxious), маппим из названия файла
  const fileToKeyMap = {
    happy: 'happy',
    excited: 'excited',
    relaxed: 'relaxed',   // файл relaxed.svg → relaxed
    calm: 'relaxed',      // если вдруг кнопка будет calm.svg
    bored: 'bored',
    anxious: 'bored',     // на всякий случай, если кнопка anxious.svg
    angry: 'angry',
    sad: 'sad'
  };

  function setCurrentDate() {
    const now = new Date();
    const days = ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'];
    currentDayElement.textContent = days[now.getDay()];
    currentDateElement.textContent = String(now.getDate()).padStart(2,'0') + '.' + String(now.getMonth()+1).padStart(2,'0');
    return { isoDate: now.toISOString().split('T')[0] };
  }

  const { isoDate: today } = setCurrentDate();

  function getRandomImage(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function showQuote(text) {
    let el = document.querySelector('.mood-quote');
    if (!el) {
      el = document.createElement('p');
      el.className = 'mood-quote';
      document.querySelector('.mood-inner').appendChild(el);
    }
    el.textContent = text;
  }

  function displayMood(moodKey) {
    const info = moodData[moodKey];
    if (!info) {
      console.warn('Нет данных для ключа настроения:', moodKey);
      return;
    }
    const randomImage = getRandomImage(info.images);
    // ВАЖНО: тут никогда не используем src нажатой иконки
    moodImage.src = `/static/frontend/mood-images/${randomImage}`;
    moodImage.alt = moodKey;
    moodImage.classList.remove('hidden');
    moodPlaceholder?.classList.add('hidden');
    showQuote(info.quote);
    console.log('Показано настроение:', moodKey, 'картинка:', randomImage);
  }

  // Сохранение в БД (оставляю вашу логику, ключ берем из файла кнопки)
  const moodNames = {
    'happy.svg': 'Happy',
    'excited.svg': 'Excited',
    'relaxed.svg': 'Relaxed',
    'bored.svg': 'Bored',
    'angry.svg': 'Angry',
    'sad.svg': 'Sad'
  };

  function getCSRFToken() {
    const el = document.querySelector('[name=csrfmiddlewaretoken]');
    return el ? el.value : '';
  }
  function getUserId() {
    const el = document.getElementById('user-data');
    return el ? el.dataset.userId : null;
  }

  async function getMoodIdByName(name) {
    const r = await fetch('/api/moods/');
    if (!r.ok) throw new Error('Ошибка загрузки настроений');
    const list = await r.json();
    const m = list.find(x => x.name === name);
    if (!m) throw new Error(`Настроение "${name}" не найдено`);
    return m.id;
  }

  async function checkExistingMood() {
    const r = await fetch('/api/daily_mood/');
    if (!r.ok) throw new Error('Ошибка при получении данных о настроении.');
    const list = await r.json();
    return list.find(m => m.date === today) || null;
  }

  async function saveMood(moodFile) {
    const userId = getUserId();
    if (!userId) throw new Error('Пользователь не авторизован');

    const moodName = moodNames[moodFile];
    if (!moodName) throw new Error('Настроение не найдено');

    const moodId = await getMoodIdByName(moodName);
    const existing = await checkExistingMood();

    if (existing) {
      await fetch(`/api/daily_mood/${existing.id}/`, {
        method: 'DELETE',
        headers: { 'X-CSRFToken': getCSRFToken() }
      });
    }

    const createResp = await fetch('/api/daily_mood/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken()
      },
      body: JSON.stringify({ date: today, mood: moodId })
    });
    if (!createResp.ok) {
      const t = await createResp.text();
      throw new Error(`Ошибка при создании настроения: ${createResp.status} - ${t}`);
    }
  }

  // Делегирование кликов — надёжно навесит обработчик
  if (moodButtonsContainer) {
    moodButtonsContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.mood-btn');
      if (!btn) return;

      // Имя файла и ключ настроения
      const src = btn.getAttribute('src') || btn.src; // работает и для относительного, и для абсолютного
      const file = src.split('/').pop().toLowerCase(); // например happy.svg
      const base = file.replace('.svg','');            // happy
      const moodKey = fileToKeyMap[base] || base;      // исправим calm→relaxed, anxious→bored

      console.log('НАСТРОЕНИЕ:', file, 'key:', moodKey);

      // Сначала отображаем
      displayMood(moodKey);

      // Потом сохраняем (не влияет на показ)
      saveMood(file).catch(err => {
        console.error('Ошибка сохранения настроения:', err);
        alert('Ошибка сохранения настроения: ' + err.message);
      });
    });
  } else {
    console.error('Контейнер .mood-buttons не найден');
  }
});