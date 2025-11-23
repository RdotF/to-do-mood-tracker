document.addEventListener("DOMContentLoaded", () => {
  const openBtn = document.getElementById("openRegistration");
  const overlay = document.querySelector(".overlay");
  const closeBtn = document.querySelector(".close-btn");

  if (!openBtn || !overlay || !closeBtn) {
    console.error("Не найден один из элементов:", {
      openBtn,
      overlay,
      closeBtn,
    });
    return;
  }

  // открыть popup
  openBtn.addEventListener("click", () => {
    overlay.classList.add("active");
    document.body.style.overflow = "hidden"; // 🔒 блокируем прокрутку страницы
  });

  // закрыть popup по крестику
  closeBtn.addEventListener("click", () => {
    overlay.classList.remove("active");
    document.body.style.overflow = ""; // 🔓 возвращаем прокрутку
  });

  // закрыть popup по клику вне окна
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.classList.remove("active");
      document.body.style.overflow = ""; // 🔓 возвращаем прокрутку
    }
  });
});
