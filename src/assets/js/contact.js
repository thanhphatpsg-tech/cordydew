const CONTACT_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbyosSNKHFKNLR8BIbLVYAiyWY5GNFwnIc6PtAR3eaVWEv1U8mwCLYOx-dztt2arZ5mswQ/exec";

const formEl = document.getElementById("contact-form");

function showToast(type, message) {
  const toast = document.getElementById("cdToast");
  const icon = document.getElementById("cdToastIcon");
  const text = document.getElementById("cdToastText");

  if (!toast || !icon || !text) return;

  toast.classList.remove("success", "error", "loading");
  toast.classList.add(type);

  icon.textContent = type === "success" ? "✓" : (type === "error" ? "!" : "…");
  text.textContent = message;

  toast.classList.add("show");

  // auto hide (trừ loading)
  if (type !== "loading") {
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove("show"), 3200);
  }
}

function setBtnLoading(isLoading) {
  const btn = formEl.querySelector('button[type="submit"]');
  if (!btn) return;

  if (isLoading) {
    btn.disabled = true;
    btn.classList.add("is-loading");
    btn.dataset.oldHtml = btn.innerHTML;
    btn.innerHTML = `<span class="cd-spinner"></span>Đang gửi...`;
  } else {
    btn.disabled = false;
    btn.classList.remove("is-loading");
    if (btn.dataset.oldHtml) btn.innerHTML = btn.dataset.oldHtml;
  }
}

formEl.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fd = new FormData(formEl);
  const payload = Object.fromEntries(fd.entries());
  payload.page = location.href;
  payload.submitted_from = "cordydew_contact";

  try {
    setBtnLoading(true);
    showToast("loading", "Đang gửi tin nhắn...");

    const res = await fetch(CONTACT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error("Server không trả JSON hợp lệ.");
    }

    if (!json.ok) throw new Error(json.error || "Gửi không thành công.");

    formEl.reset();
    showToast("success", "Đã gửi thành công! CordyDew sẽ phản hồi sớm.");
  } catch (err) {
    console.error(err);
    showToast("error", "Gửi thất bại: " + (err.message || err));
  } finally {
    setBtnLoading(false);
  }
});
