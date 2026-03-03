(function () {
  const YT_EMBED = "https://www.youtube.com/embed/PFWLGSN7Wbo?si=JR5jqfBx4z1sZzhX";

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
// const SHEETS_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbzaxQIjA3dJ5HExlIrMPjBICSxUkVfeccrLXFiN1V3ML4SaJpH5DBUaihalPWO82Ilo/exec";
const SHEETS_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbz8Bp2NXMp69J4j8gXczEA6WF4Jx0Nd19PAT-P830v6cXHzTX4yC5j-xZ9S9j-r8KuU/exec";

// Map giá trị tuổi từ sheet -> label tiếng Việt
const AGE_LABEL_MAP = {
  under18: "Dưới 18",
  k: "",         // nếu bạn muốn giữ "K" hoặc đổi thành "Không muốn trả lời" thì sửa ở đây
  K: "",
  unknown: "—",
  "": "—",
  null: "—"
};

function normalizeAgeLabel(v) {
  const key = String(v ?? "").trim();
  return AGE_LABEL_MAP[key] ?? key; 
}

async function loadSurveyStatsToFunfact() {
  try {
    const res = await fetch(`${SHEETS_WEBAPP_URL}?mode=stats&t=${Date.now()}`, {
      cache: "no-store",
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || "Cannot load stats");

    const s = json.stats || {};

    await new Promise((r) => setTimeout(r, 100));

    setCount("stat_total", s.total ?? 0);
    setCount("stat_today", s.today ?? 0);
    setCount("stat_age_groups", s.age_groups ?? 0);

    document.dispatchEvent(new CustomEvent("survey:statsLoaded", { detail: s }));
  } catch (e) {
    console.warn("loadSurveyStatsToFunfact:", e);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadSurveyStatsToFunfact);
} else {
  loadSurveyStatsToFunfact();
}

function setCount(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  const v = Number(value) || 0;
  el.setAttribute("data-from", "0");
  el.setAttribute("data-to", String(v));
  el.textContent = String(v);
}

document.addEventListener("DOMContentLoaded", loadSurveyStatsToFunfact);
