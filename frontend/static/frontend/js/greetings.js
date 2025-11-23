document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.querySelector(".btn-login");
  loginBtn.addEventListener("click", () => {
    window.location.href = "/login/";
  });
});
