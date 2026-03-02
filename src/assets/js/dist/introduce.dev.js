"use strict";

document.addEventListener("DOMContentLoaded", function () {
  var imgs = Array.from(document.querySelectorAll(".js-zoom-img"));
  var lightbox = document.getElementById("cdLightbox");
  var lightboxImg = document.getElementById("cdLightboxImg");
  var closeBtn = document.querySelector(".cd-lightbox-close");
  var prevBtn = document.querySelector(".cd-lightbox-prev");
  var nextBtn = document.querySelector(".cd-lightbox-next");
  if (!lightbox || !lightboxImg || !closeBtn || imgs.length === 0) return;
  var currentIndex = 0;

  var setNavState = function setNavState() {
    // Nếu muốn vòng lặp (last -> first) thì bỏ 2 dòng disable này
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === imgs.length - 1;
  };

  var showAt = function showAt(idx) {
    currentIndex = Math.max(0, Math.min(imgs.length - 1, idx));
    var img = imgs[currentIndex];
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt || "";
    setNavState();
  };

  var open = function open(idx) {
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden";
    showAt(idx);
  };

  var close = function close() {
    lightbox.classList.remove("active");
    lightboxImg.src = "";
    document.body.style.overflow = "";
  };

  var prev = function prev() {
    if (currentIndex > 0) showAt(currentIndex - 1); // Nếu muốn vòng lặp: showAt((currentIndex - 1 + imgs.length) % imgs.length);
  };

  var next = function next() {
    if (currentIndex < imgs.length - 1) showAt(currentIndex + 1); // Nếu muốn vòng lặp: showAt((currentIndex + 1) % imgs.length);
  };

  imgs.forEach(function (img, i) {
    img.style.cursor = "zoom-in";
    img.addEventListener("click", function () {
      return open(i);
    });
  });
  closeBtn.addEventListener("click", close);
  prevBtn.addEventListener("click", prev);
  nextBtn.addEventListener("click", next); // click ra ngoài ảnh để đóng

  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) close();
  }); // phím tắt

  document.addEventListener("keydown", function (e) {
    if (!lightbox.classList.contains("active")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  }); // Swipe cơ bản cho mobile

  var startX = null;
  lightboxImg.addEventListener("touchstart", function (e) {
    startX = e.touches[0].clientX;
  }, {
    passive: true
  });
  lightboxImg.addEventListener("touchend", function (e) {
    if (startX === null) return;
    var endX = e.changedTouches[0].clientX;
    var diff = endX - startX;
    startX = null;
    if (Math.abs(diff) < 40) return;
    if (diff > 0) prev();else next();
  }, {
    passive: true
  });
});