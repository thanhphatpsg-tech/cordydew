(function () {
    const YT_EMBED = "https://www.youtube.com/embed/JRl7iJqFGiw?autoplay=1&mute=1";

    const modal = document.getElementById("videoModal");
    const frame = document.getElementById("videoFrame");

    function openVideo() {
        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        frame.src = YT_EMBED;
    }

    function closeVideo() {
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        frame.src = ""; // tắt video khi đóng
    }

    document.addEventListener("click", function (e) {
        const openBtn = e.target.closest("[data-video-open]");
        const closeBtn = e.target.closest("[data-video-close]");

        if (openBtn) {
            e.preventDefault();
            openVideo();
        }
        if (closeBtn) {
            e.preventDefault();
            closeVideo();
        }
    });

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && modal.classList.contains("is-open")) closeVideo();
    });
})();
// ================
