"use strict";

var CONTACT_ENDPOINT = // "https://script.google.com/macros/s/AKfycbyosSNKHFKNLR8BIbLVYAiyWY5GNFwnIc6PtAR3eaVWEv1U8mwCLYOx-dztt2arZ5mswQ/exec";
"https://script.google.com/macros/s/AKfycbwBxyrqgTLBwTCkQ6_MixoiUAxGaApup0xKwn8JQWy_0VXbXmnptK3ACi22xA6t738P7g/exec";
var formEl = document.getElementById("contact-form");

function showToast(type, message) {
  var toast = document.getElementById("cdToast");
  var icon = document.getElementById("cdToastIcon");
  var text = document.getElementById("cdToastText");
  if (!toast || !icon || !text) return;
  toast.classList.remove("success", "error", "loading");
  toast.classList.add(type);
  icon.textContent = type === "success" ? "✓" : type === "error" ? "!" : "…";
  text.textContent = message;
  toast.classList.add("show"); // auto hide (trừ loading)

  if (type !== "loading") {
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () {
      return toast.classList.remove("show");
    }, 3200);
  }
}

function setBtnLoading(isLoading) {
  var btn = formEl.querySelector('button[type="submit"]');
  if (!btn) return;

  if (isLoading) {
    btn.disabled = true;
    btn.classList.add("is-loading");
    btn.dataset.oldHtml = btn.innerHTML;
    btn.innerHTML = "<span class=\"cd-spinner\"></span>\u0110ang g\u1EEDi...";
  } else {
    btn.disabled = false;
    btn.classList.remove("is-loading");
    if (btn.dataset.oldHtml) btn.innerHTML = btn.dataset.oldHtml;
  }
}

formEl.addEventListener("submit", function _callee(e) {
  var fd, payload, res, text, json;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          e.preventDefault();
          fd = new FormData(formEl);
          payload = Object.fromEntries(fd.entries());
          payload.page = location.href;
          payload.submitted_from = "cordydew_contact";
          _context.prev = 5;
          setBtnLoading(true);
          showToast("loading", "Đang gửi tin nhắn...");
          _context.next = 10;
          return regeneratorRuntime.awrap(fetch(CONTACT_ENDPOINT, {
            method: "POST",
            headers: {
              "Content-Type": "text/plain;charset=utf-8"
            },
            body: JSON.stringify(payload)
          }));

        case 10:
          res = _context.sent;
          _context.next = 13;
          return regeneratorRuntime.awrap(res.text());

        case 13:
          text = _context.sent;
          _context.prev = 14;
          json = JSON.parse(text);
          _context.next = 21;
          break;

        case 18:
          _context.prev = 18;
          _context.t0 = _context["catch"](14);
          throw new Error("Server không trả JSON hợp lệ.");

        case 21:
          if (json.ok) {
            _context.next = 23;
            break;
          }

          throw new Error(json.error || "Gửi không thành công.");

        case 23:
          formEl.reset();
          showToast("success", "Đã gửi thành công! CordyDew sẽ phản hồi sớm.");
          _context.next = 31;
          break;

        case 27:
          _context.prev = 27;
          _context.t1 = _context["catch"](5);
          console.error(_context.t1);
          showToast("error", "Gửi thất bại: " + (_context.t1.message || _context.t1));

        case 31:
          _context.prev = 31;
          setBtnLoading(false);
          return _context.finish(31);

        case 34:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[5, 27, 31, 34], [14, 18]]);
});