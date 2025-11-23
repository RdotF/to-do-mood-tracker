document.addEventListener("DOMContentLoaded", () => {
  const openLoginBtn = document.querySelector(".btn-login"); // кнопка "Войти" на greetings
  const loginOverlay = document.querySelector(".login-overlay");
  const closeLoginBtn = loginOverlay.querySelector(".close-btn");

  if (!openLoginBtn || !loginOverlay || !closeLoginBtn) return;

  openLoginBtn.addEventListener("click", () => {
    loginOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
  });

  closeLoginBtn.addEventListener("click", () => {
    loginOverlay.classList.remove("active");
    document.body.style.overflow = "";
  });

  loginOverlay.addEventListener("click", (e) => {
    if (e.target === loginOverlay) {
      loginOverlay.classList.remove("active");
      document.body.style.overflow = "";
    }
  });
});
