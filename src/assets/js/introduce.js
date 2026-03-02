document.addEventListener("DOMContentLoaded", () => {
  const imgs = Array.from(document.querySelectorAll(".js-zoom-img"));
  const lightbox = document.getElementById("cdLightbox");
  const lightboxImg = document.getElementById("cdLightboxImg");
  const closeBtn = document.querySelector(".cd-lightbox-close");
  const prevBtn = document.querySelector(".cd-lightbox-prev");
  const nextBtn = document.querySelector(".cd-lightbox-next");

  if (!lightbox || !lightboxImg || !closeBtn || imgs.length === 0) return;

  let currentIndex = 0;

  const setNavState = () => {
    // Nếu muốn vòng lặp (last -> first) thì bỏ 2 dòng disable này
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === imgs.length - 1;
  };

  const showAt = (idx) => {
    currentIndex = Math.max(0, Math.min(imgs.length - 1, idx));
    const img = imgs[currentIndex];
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt || "";
    setNavState();
  };

  const open = (idx) => {
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden";
    showAt(idx);
  };

  const close = () => {
    lightbox.classList.remove("active");
    lightboxImg.src = "";
    document.body.style.overflow = "";
  };

  const prev = () => {
    if (currentIndex > 0) showAt(currentIndex - 1);
    // Nếu muốn vòng lặp: showAt((currentIndex - 1 + imgs.length) % imgs.length);
  };

  const next = () => {
    if (currentIndex < imgs.length - 1) showAt(currentIndex + 1);
    // Nếu muốn vòng lặp: showAt((currentIndex + 1) % imgs.length);
  };

  imgs.forEach((img, i) => {
    img.style.cursor = "zoom-in";
    img.addEventListener("click", () => open(i));
  });

  closeBtn.addEventListener("click", close);
  prevBtn.addEventListener("click", prev);
  nextBtn.addEventListener("click", next);

  // click ra ngoài ảnh để đóng
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) close();
  });

  // phím tắt
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("active")) return;

    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  });

  // Swipe cơ bản cho mobile
  let startX = null;
  lightboxImg.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
  }, { passive: true });

  lightboxImg.addEventListener("touchend", (e) => {
    if (startX === null) return;
    const endX = e.changedTouches[0].clientX;
    const diff = endX - startX;
    startX = null;

    if (Math.abs(diff) < 40) return;
    if (diff > 0) prev();
    else next();
  }, { passive: true });
});