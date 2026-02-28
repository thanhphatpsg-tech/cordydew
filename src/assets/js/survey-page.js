(function () {
    const form = document.getElementById('surveyForm');
    if (!form) return;

    const qsAll = (sel, root = document) => Array.from(root.querySelectorAll(sel));
    const qBlocks = qsAll('.survey-q', form);

    const progressBar = document.getElementById('surveyProgressBar');
    const progressText = document.getElementById('surveyProgressText');
    const stepText = document.getElementById('surveyStepText');

    const resultBox = document.getElementById('surveyResult');
    const resultDesc = document.getElementById('surveyResultDesc');
    const jsonBox = document.getElementById('surveyJson');

    const resetBtn = document.getElementById('surveyResetBtn');

    function isEmail(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    }
    function isPhone(v) {
        // VN basic: 9-11 digits, allow +84, spaces, dots, dashes
        const x = v.replace(/[.\s-]/g, '');
        return /^(\+?84|0)\d{8,10}$/.test(x);
    }

    function getAnsweredRequiredCount() {
        let answered = 0;
        let requiredTotal = 0;

        qBlocks.forEach(q => {
            const required = q.getAttribute('data-required') === '1';
            if (!required) return;

            requiredTotal++;

            // find input types inside
            const radios = qsAll('input[type="radio"]', q);
            const checks = qsAll('input[type="checkbox"]', q);
            const selects = qsAll('select', q);
            const inputs = qsAll('input[type="text"], input[type="email"], input[type="tel"]', q);

            let ok = false;

            if (radios.length) {
                ok = radios.some(r => r.checked);
            } else if (checks.length) {
                const min = parseInt(q.getAttribute('data-minchecks') || '1', 10);
                ok = checks.filter(c => c.checked).length >= min;
            } else if (selects.length) {
                ok = selects.every(s => (s.value || '').trim() !== '');
            } else if (inputs.length) {
                const v = (inputs[0].value || '').trim();
                if (inputs[0].name === 'contact') ok = (v.length > 0) && (isEmail(v) || isPhone(v));
                else ok = v.length > 0;
            }

            if (ok) answered++;
        });

        return { answered, requiredTotal };
    }

    function updateProgress() {
        const { answered, requiredTotal } = getAnsweredRequiredCount();
        const pct = requiredTotal ? Math.round((answered / requiredTotal) * 100) : 0;

        if (progressBar) progressBar.style.width = pct + '%';
        if (progressText) progressText.textContent = pct + '% hoàn thành';
        if (stepText) stepText.textContent = answered + '/' + requiredTotal;
    }

    function markValid(q) { q.classList.remove('is-invalid'); }
    function markInvalid(q) { q.classList.add('is-invalid'); }

    function validateBlock(q) {
        const required = q.getAttribute('data-required') === '1';
        if (!required) { markValid(q); return true; }

        const radios = qsAll('input[type="radio"]', q);
        const checks = qsAll('input[type="checkbox"]', q);
        const selects = qsAll('select', q);
        const inputs = qsAll('input[type="text"], input[type="email"], input[type="tel"]', q);

        let ok = true;

        if (radios.length) {
            ok = radios.some(r => r.checked);
        } else if (checks.length) {
            const min = parseInt(q.getAttribute('data-minchecks') || '1', 10);
            ok = checks.filter(c => c.checked).length >= min;
        } else if (selects.length) {
            ok = selects.every(s => (s.value || '').trim() !== '');
        } else if (inputs.length) {
            const v = (inputs[0].value || '').trim();
            if (inputs[0].name === 'contact') ok = (v.length > 0) && (isEmail(v) || isPhone(v));
            else ok = v.length > 0;
        }

        ok ? markValid(q) : markInvalid(q);
        return ok;
    }

    function validateAll() {
        let ok = true;
        qBlocks.forEach(q => { if (!validateBlock(q)) ok = false; });
        return ok;
    }

    function collectData() {
        const data = {};

        // radio groups
        ['source', 'goal', 'overall', 'nps'].forEach(name => {
            const el = form.querySelector('input[name="' + name + '"]:checked');
            data[name] = el ? el.value : null;
        });

        // checkboxes likes
        data.likes = qsAll('input[name="likes"]:checked', form).map(x => x.value);

        // select + text
        const age = form.querySelector('select[name="age"]');
        const improve = form.querySelector('textarea[name="improve"]');
        const contact = form.querySelector('input[name="contact"]');

        data.age = age ? age.value : null;
        data.improve = improve ? (improve.value || '').trim() : '';
        data.contact = contact ? (contact.value || '').trim() : '';

        // scoring simple
        const overall = parseInt(data.overall || '0', 10);
        const nps = parseInt(data.nps || '0', 10);
        data.score = {
            overall,
            nps,
            nps_group: (nps >= 9) ? 'promoter' : (nps >= 7 ? 'passive' : 'detractor')
        };

        data.meta = {
            submitted_at: new Date().toISOString(),
            user_agent: navigator.userAgent
        };

        return data;
    }

    function scrollToFirstInvalid() {
        const first = form.querySelector('.survey-q.is-invalid');
        if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // listeners to update progress + clear invalid when user changes
    form.addEventListener('input', function (e) {
        const q = e.target.closest('.survey-q');
        if (q) validateBlock(q);
        updateProgress();
    });
    form.addEventListener('change', function (e) {
        const q = e.target.closest('.survey-q');
        if (q) validateBlock(q);
        updateProgress();
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        resultBox.style.display = 'none';

        const ok = validateAll();
        updateProgress();

        if (!ok) {
            scrollToFirstInvalid();
            return;
        }

        const data = collectData();

        // Result text
        const overall = data.score.overall;
        const npsGroup = data.score.nps_group;
        let msg = 'Bạn đã hoàn thành khảo sát.';
        if (overall >= 4) msg = 'Bạn đánh giá rất tích cực, cảm ơn bạn!';
        if (npsGroup === 'detractor') msg = 'Cảm ơn bạn. Chúng tôi sẽ ưu tiên cải thiện trải nghiệm.';

        resultDesc.textContent = msg;

        // Show JSON (simulate submit)
        jsonBox.textContent = JSON.stringify(data, null, 2);
        jsonBox.style.display = 'none';
        resultBox.style.display = 'block';

        // Optional: fake API call
        // fetch('/api/survey', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data)})
    });

    resetBtn.addEventListener('click', function () {
        form.reset();
        qBlocks.forEach(markValid);
        resultBox.style.display = 'none';
        updateProgress();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // init
    updateProgress();
})();


//============================================

// const SHEETS_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbzaxQIjA3dJ5HExlIrMPjBICSxUkVfeccrLXFiN1V3ML4SaJpH5DBUaihalPWO82Ilo/exec";
const SHEETS_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbz8Bp2NXMp69J4j8gXczEA6WF4Jx0Nd19PAT-P830v6cXHzTX4yC5j-xZ9S9j-r8KuU/exec";
function formToJSON(form) {
  const fd = new FormData(form);
  const obj = {};

  for (const [key, value] of fd.entries()) {
    // checkbox name kiểu c1_time[] sẽ ra key "c1_time[]"
    const cleanKey = key.endsWith("[]") ? key.slice(0, -2) : key;

    if (obj[cleanKey] !== undefined) {
      if (!Array.isArray(obj[cleanKey])) obj[cleanKey] = [obj[cleanKey]];
      obj[cleanKey].push(value);
    } else {
      obj[cleanKey] = value;
    }
  }

  // Nếu dùng input "Khác" (a_job_other) mà a_job != other -> có thể xóa
  if (obj.a_job !== "other") delete obj.a_job_other;

  return obj;
}

document.getElementById("surveyForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = e.currentTarget;

  // TODO: nếu bạn đã có validate hiện tại thì giữ nguyên, chỉ cần đảm bảo pass mới gửi
  // if (!validateSurvey(form)) return;

  const payload = formToJSON(form);

  const btn = document.getElementById("surveySubmitBtn");
  const oldText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = "Đang gửi...";

  try {
    const res = await fetch(SHEETS_WEBAPP_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });

    const json = await res.json();

    if (!json.ok) throw new Error(json.error || "Submit failed");

    // UI success (bạn có sẵn surveyResult)
    const resultBox = document.getElementById("surveyResult");
    const desc = document.getElementById("surveyResultDesc");
    const pre = document.getElementById("surveyJson");

    desc.textContent = "Bọn mình đã nhận được phản hồi của bạn. Cảm ơn bạn nhiều!";
    pre.textContent = JSON.stringify(payload, null, 2);
    resultBox.style.display = "block";

    form.reset();
    // TODO: nếu bạn có progress reset -> gọi lại hàm updateProgress()
  } catch (err) {
    alert("Gửi thất bại: " + err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = oldText;
  }
});
