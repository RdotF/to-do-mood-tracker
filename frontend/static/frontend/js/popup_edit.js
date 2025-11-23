document.addEventListener("DOMContentLoaded", () => {
  const openBtn = document.querySelector(".btn-change");
  const overlay = document.querySelector(".edit-overlay");
  const closeBtn = overlay ? overlay.querySelector(".close-btn") : null;

  if (!openBtn) {
    console.warn("popup_edit: openBtn ('.btn-change') не найден");
    return;
  }
  if (!overlay) {
    console.warn("popup_edit: overlay ('.edit-overlay') не найден");
    return;
  }
  if (!closeBtn) {
    console.warn("popup_edit: closeBtn не найден внутри overlay");
    return;
  }

  openBtn.addEventListener("click", () => {
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  });

  closeBtn.addEventListener("click", () => {
    overlay.classList.remove("active");
    document.body.style.overflow = "";
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.classList.remove("active");
      document.body.style.overflow = "";
    }
  });
});
