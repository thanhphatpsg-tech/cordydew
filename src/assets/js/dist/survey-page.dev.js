"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

(function () {
  var form = document.getElementById('surveyForm');
  if (!form) return;

  var qsAll = function qsAll(sel) {
    var root = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;
    return Array.from(root.querySelectorAll(sel));
  };

  var qBlocks = qsAll('.survey-q', form);
  var progressBar = document.getElementById('surveyProgressBar');
  var progressText = document.getElementById('surveyProgressText');
  var stepText = document.getElementById('surveyStepText');
  var resultBox = document.getElementById('surveyResult');
  var resultDesc = document.getElementById('surveyResultDesc');
  var jsonBox = document.getElementById('surveyJson');
  var resetBtn = document.getElementById('surveyResetBtn');

  function isEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function isPhone(v) {
    // VN basic: 9-11 digits, allow +84, spaces, dots, dashes
    var x = v.replace(/[.\s-]/g, '');
    return /^(\+?84|0)\d{8,10}$/.test(x);
  }

  function getAnsweredRequiredCount() {
    var answered = 0;
    var requiredTotal = 0;
    qBlocks.forEach(function (q) {
      var required = q.getAttribute('data-required') === '1';
      if (!required) return;
      requiredTotal++; // find input types inside

      var radios = qsAll('input[type="radio"]', q);
      var checks = qsAll('input[type="checkbox"]', q);
      var selects = qsAll('select', q);
      var inputs = qsAll('input[type="text"], input[type="email"], input[type="tel"]', q);
      var ok = false;

      if (radios.length) {
        ok = radios.some(function (r) {
          return r.checked;
        });
      } else if (checks.length) {
        var min = parseInt(q.getAttribute('data-minchecks') || '1', 10);
        ok = checks.filter(function (c) {
          return c.checked;
        }).length >= min;
      } else if (selects.length) {
        ok = selects.every(function (s) {
          return (s.value || '').trim() !== '';
        });
      } else if (inputs.length) {
        var v = (inputs[0].value || '').trim();
        if (inputs[0].name === 'contact') ok = v.length > 0 && (isEmail(v) || isPhone(v));else ok = v.length > 0;
      }

      if (ok) answered++;
    });
    return {
      answered: answered,
      requiredTotal: requiredTotal
    };
  }

  function updateProgress() {
    var _getAnsweredRequiredC = getAnsweredRequiredCount(),
        answered = _getAnsweredRequiredC.answered,
        requiredTotal = _getAnsweredRequiredC.requiredTotal;

    var pct = requiredTotal ? Math.round(answered / requiredTotal * 100) : 0;
    if (progressBar) progressBar.style.width = pct + '%';
    if (progressText) progressText.textContent = pct + '% hoàn thành';
    if (stepText) stepText.textContent = answered + '/' + requiredTotal;
  }

  function markValid(q) {
    q.classList.remove('is-invalid');
  }

  function markInvalid(q) {
    q.classList.add('is-invalid');
  }

  function validateBlock(q) {
    var required = q.getAttribute('data-required') === '1';

    if (!required) {
      markValid(q);
      return true;
    }

    var radios = qsAll('input[type="radio"]', q);
    var checks = qsAll('input[type="checkbox"]', q);
    var selects = qsAll('select', q);
    var inputs = qsAll('input[type="text"], input[type="email"], input[type="tel"]', q);
    var ok = true;

    if (radios.length) {
      ok = radios.some(function (r) {
        return r.checked;
      });
    } else if (checks.length) {
      var min = parseInt(q.getAttribute('data-minchecks') || '1', 10);
      ok = checks.filter(function (c) {
        return c.checked;
      }).length >= min;
    } else if (selects.length) {
      ok = selects.every(function (s) {
        return (s.value || '').trim() !== '';
      });
    } else if (inputs.length) {
      var v = (inputs[0].value || '').trim();
      if (inputs[0].name === 'contact') ok = v.length > 0 && (isEmail(v) || isPhone(v));else ok = v.length > 0;
    }

    ok ? markValid(q) : markInvalid(q);
    return ok;
  }

  function validateAll() {
    var ok = true;
    qBlocks.forEach(function (q) {
      if (!validateBlock(q)) ok = false;
    });
    return ok;
  }

  function collectData() {
    var data = {}; // radio groups

    ['source', 'goal', 'overall', 'nps'].forEach(function (name) {
      var el = form.querySelector('input[name="' + name + '"]:checked');
      data[name] = el ? el.value : null;
    }); // checkboxes likes

    data.likes = qsAll('input[name="likes"]:checked', form).map(function (x) {
      return x.value;
    }); // select + text

    var age = form.querySelector('select[name="age"]');
    var improve = form.querySelector('textarea[name="improve"]');
    var contact = form.querySelector('input[name="contact"]');
    data.age = age ? age.value : null;
    data.improve = improve ? (improve.value || '').trim() : '';
    data.contact = contact ? (contact.value || '').trim() : ''; // scoring simple

    var overall = parseInt(data.overall || '0', 10);
    var nps = parseInt(data.nps || '0', 10);
    data.score = {
      overall: overall,
      nps: nps,
      nps_group: nps >= 9 ? 'promoter' : nps >= 7 ? 'passive' : 'detractor'
    };
    data.meta = {
      submitted_at: new Date().toISOString(),
      user_agent: navigator.userAgent
    };
    return data;
  }

  function scrollToFirstInvalid() {
    var first = form.querySelector('.survey-q.is-invalid');
    if (first) first.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  } // listeners to update progress + clear invalid when user changes


  form.addEventListener('input', function (e) {
    var q = e.target.closest('.survey-q');
    if (q) validateBlock(q);
    updateProgress();
  });
  form.addEventListener('change', function (e) {
    var q = e.target.closest('.survey-q');
    if (q) validateBlock(q);
    updateProgress();
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    resultBox.style.display = 'none';
    var ok = validateAll();
    updateProgress();

    if (!ok) {
      scrollToFirstInvalid();
      return;
    }

    var data = collectData(); // Result text

    var overall = data.score.overall;
    var npsGroup = data.score.nps_group;
    var msg = 'Bạn đã hoàn thành khảo sát.';
    if (overall >= 4) msg = 'Bạn đánh giá rất tích cực, cảm ơn bạn!';
    if (npsGroup === 'detractor') msg = 'Cảm ơn bạn. Chúng tôi sẽ ưu tiên cải thiện trải nghiệm.';
    resultDesc.textContent = msg; // Show JSON (simulate submit)

    jsonBox.textContent = JSON.stringify(data, null, 2);
    jsonBox.style.display = 'none';
    resultBox.style.display = 'block'; // Optional: fake API call
    // fetch('/api/survey', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data)})
  });
  resetBtn.addEventListener('click', function () {
    form.reset();
    qBlocks.forEach(markValid);
    resultBox.style.display = 'none';
    updateProgress();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }); // init

  updateProgress();
})(); //============================================
// const SHEETS_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbzaxQIjA3dJ5HExlIrMPjBICSxUkVfeccrLXFiN1V3ML4SaJpH5DBUaihalPWO82Ilo/exec";


var SHEETS_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbz8Bp2NXMp69J4j8gXczEA6WF4Jx0Nd19PAT-P830v6cXHzTX4yC5j-xZ9S9j-r8KuU/exec";

function formToJSON(form) {
  var fd = new FormData(form);
  var obj = {};
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = fd.entries()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _step$value = _slicedToArray(_step.value, 2),
          key = _step$value[0],
          value = _step$value[1];

      // checkbox name kiểu c1_time[] sẽ ra key "c1_time[]"
      var cleanKey = key.endsWith("[]") ? key.slice(0, -2) : key;

      if (obj[cleanKey] !== undefined) {
        if (!Array.isArray(obj[cleanKey])) obj[cleanKey] = [obj[cleanKey]];
        obj[cleanKey].push(value);
      } else {
        obj[cleanKey] = value;
      }
    } // Nếu dùng input "Khác" (a_job_other) mà a_job != other -> có thể xóa

  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator["return"] != null) {
        _iterator["return"]();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  if (obj.a_job !== "other") delete obj.a_job_other;
  return obj;
}

document.getElementById("surveyForm").addEventListener("submit", function _callee(e) {
  var form, payload, btn, oldText, res, json, resultBox, desc, pre;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          e.preventDefault();
          form = e.currentTarget; // TODO: nếu bạn đã có validate hiện tại thì giữ nguyên, chỉ cần đảm bảo pass mới gửi
          // if (!validateSurvey(form)) return;

          payload = formToJSON(form);
          btn = document.getElementById("surveySubmitBtn");
          oldText = btn.innerHTML;
          btn.disabled = true;
          btn.innerHTML = "Đang gửi...";
          _context.prev = 7;
          _context.next = 10;
          return regeneratorRuntime.awrap(fetch(SHEETS_WEBAPP_URL, {
            method: "POST",
            headers: {
              "Content-Type": "text/plain;charset=utf-8"
            },
            body: JSON.stringify(payload)
          }));

        case 10:
          res = _context.sent;
          _context.next = 13;
          return regeneratorRuntime.awrap(res.json());

        case 13:
          json = _context.sent;

          if (json.ok) {
            _context.next = 16;
            break;
          }

          throw new Error(json.error || "Submit failed");

        case 16:
          // UI success (bạn có sẵn surveyResult)
          resultBox = document.getElementById("surveyResult");
          desc = document.getElementById("surveyResultDesc");
          pre = document.getElementById("surveyJson");
          desc.textContent = "Bọn mình đã nhận được phản hồi của bạn. Cảm ơn bạn nhiều!";
          pre.textContent = JSON.stringify(payload, null, 2);
          resultBox.style.display = "block";
          form.reset(); // TODO: nếu bạn có progress reset -> gọi lại hàm updateProgress()

          _context.next = 28;
          break;

        case 25:
          _context.prev = 25;
          _context.t0 = _context["catch"](7);
          alert("Gửi thất bại: " + _context.t0.message);

        case 28:
          _context.prev = 28;
          btn.disabled = false;
          btn.innerHTML = oldText;
          return _context.finish(28);

        case 32:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[7, 25, 28, 32]]);
});