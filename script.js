/* =========================
   MySchool interactive scripts
   - Part 1: Event handling basics
   - Part 2: Interactive features (light/dark, counter, accordion, dropdown, tabs, slider)
   - Part 3: Custom form validation
   Each section below is commented and self-contained.
   ========================= */

/* -------------------------
   Helpers
   ------------------------- */
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

function escapeHtml(str='') {
  return String(str).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

/* -------------------------
   HERO SLIDER (Part 1 interactive)
   - cycles images every 4s, pauses on hover
   ------------------------- */
(function heroSlider() {
  const slides = $$('.hero .slide');
  if (!slides.length) return;
  let idx = 0;
  slides[idx].classList.add('active');
  let timer = setInterval(next, 4000);

  function next() {
    slides[idx].classList.remove('active');
    idx = (idx + 1) % slides.length;
    slides[idx].classList.add('active');
  }

  const hero = $('.hero');
  hero.addEventListener('mouseenter', () => clearInterval(timer));
  hero.addEventListener('mouseleave', () => timer = setInterval(next, 4000));
})();

/* -------------------------
   THEME TOGGLE (Part 2: Light/Dark)
   - toggles data-theme on <body>
   - updates accessible aria-pressed attributes
   ------------------------- */
(function themeToggle() {
  const btnHeader = $('#themeToggle');
  const btnSection = $('#themeBtn');
  const body = document.body;

  function toggle() {
    const isDark = body.getAttribute('data-theme') === 'dark';
    body.setAttribute('data-theme', isDark ? 'light' : 'dark');
    // update buttons
    const pressed = !isDark;
    if (btnHeader) btnHeader.setAttribute('aria-pressed', String(pressed));
    if (btnHeader) btnHeader.textContent = pressed ? '☀️' : '🌙';
  }

  if (btnHeader) btnHeader.addEventListener('click', toggle);
  if (btnSection) btnSection.addEventListener('click', toggle);
})();

/* -------------------------
   COUNTER / BUTTON GAME (Part 2)
   - increment/decrement, win message at 10
   - demonstrates click events and DOM updates
   ------------------------- */
(function counterGame() {
  const inc = $('#incBtn');
  const dec = $('#decBtn');
  const reset = $('#resetCount');
  const display = $('#countDisplay');
  const msg = $('#countMessage');
  let count = 0;

  function update() {
    display.textContent = count;
    msg.textContent = count >= 10 ? '🎉 You reached 10 — well done!' : 'Keep going...';
  }

  if (inc) inc.addEventListener('click', () => { count++; update(); });
  if (dec) dec.addEventListener('click', () => { count = Math.max(0, count-1); update(); });
  if (reset) reset.addEventListener('click', () => { count = 0; update(); });

  update();
})();

/* -------------------------
   ACCORDION (Collapsible FAQ)
   - basic toggle behavior for accordion items
   ------------------------- */
(function accordion() {
  const toggles = $$('.acc-toggle');
  toggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const panel = btn.nextElementSibling;
      const isOpen = panel.style.display === 'block';
      // Close all panels
      $$('.acc-panel').forEach(p => p.style.display = 'none');
      if (!isOpen) panel.style.display = 'block';
    });
  });
})();

/* -------------------------
   DROPDOWN MENU
   - toggles menu and handles choice selection
   ------------------------- */
(function dropdown() {
  const dropBtn = $('#dropBtn');
  const menu = $('#dropMenu');
  const choice = $('#dropChoice');

  function closeMenu() {
    menu.classList.remove('show');
    menu.setAttribute('aria-hidden', 'true');
  }

  if (dropBtn) {
    dropBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const shown = menu.classList.toggle('show');
      menu.setAttribute('aria-hidden', String(!shown));
    });
  }

  if (menu) {
    menu.addEventListener('click', (e) => {
      if (e.target && e.target.matches('.menu-item')) {
        const text = e.target.textContent.trim();
        choice.textContent = `Selected: ${text}`;
        closeMenu();
      }
    });
  }

  // Close when clicking outside
  document.addEventListener('click', () => closeMenu());
})();

/* -------------------------
   TABS (Tabbed interface)
   - switches active panel and button
   ------------------------- */
(function tabs() {
  const tabBtns = $$('.tab-btn');
  const panels = $$('.tab-panel');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      // deactivate
      tabBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
      panels.forEach(p => p.classList.remove('active'));
      // activate
      btn.classList.add('active'); btn.setAttribute('aria-selected','true');
      const panel = $('#'+target);
      if (panel) panel.classList.add('active');
    });
  });
})();

/* -------------------------
   FLASHCARD GENERATOR (Interactive)
   - simple heuristic: split notes into sentences and make Q/A cards
   - builds flip cards dynamically
   ------------------------- */
(function flashcardGenerator() {
  const notesEl = $('#notes');
  const genBtn = $('#generateBtn');
  const clearBtn = $('#clearCards');
  const cardsRoot = $('#cards');

  function extractSentences(text) {
    const normalized = text.replace(/\s+/g,' ').trim();
    if (!normalized) return [];
    const arr = normalized.split(/(?<=[.?!])\s+/);
    return arr.filter(s => s.length > 30);
  }

  function makeCard(question, answer, idx) {
    const wrap = document.createElement('div');
    wrap.className = 'card3d';
    const inner = document.createElement('div');
    inner.className = 'card3d-inner';
    const front = document.createElement('div');
    front.className = 'card-face card-front';
    front.innerHTML = `<div><strong>Q${idx+1}.</strong><p>${escapeHtml(question)}</p></div>`;
    const back = document.createElement('div');
    back.className = 'card-face card-back';
    back.innerHTML = `<div><strong>A${idx+1}.</strong><p>${escapeHtml(answer)}</p></div>`;
    inner.appendChild(front);
    inner.appendChild(back);
    wrap.appendChild(inner);
    return wrap;
  }

  function render(list) {
    cardsRoot.innerHTML = '';
    if (!list.length) { cardsRoot.innerHTML = '<p class="muted">No flashcards yet.</p>'; return; }
    list.forEach((c,i) => cardsRoot.appendChild(makeCard(c.question, c.answer, i)));
  }

  if (genBtn) genBtn.addEventListener('click', () => {
    const text = notesEl.value || '';
    const sentences = extractSentences(text);
    if (!sentences.length) {
      cardsRoot.innerHTML = '<p class="muted">Please paste longer notes (a few sentences).</p>';
      return;
    }
    const picks = sentences.slice(0,5);
    const cards = picks.map((s,i) => {
      const preview = s.split(/\s+/).slice(0,8).join(' ');
      return { question: `Explain: "${preview}..."`, answer: s.trim() };
    });
    render(cards);
  });

  if (clearBtn) clearBtn.addEventListener('click', () => { notesEl.value = ''; cardsRoot.innerHTML = ''; });
  // load empty initially
  render([]);
})();

/* -------------------------
   FORM VALIDATION (Part 3)
   - custom validation only (no HTML5-only)
   - prevents submission using event.preventDefault()
   - shows inline errors and success message
   ------------------------- */
(function formValidation() {
  const form = $('#registerForm');
  if (!form) return;

  const fullname = $('#fullname');
  const email = $('#email');
  const password = $('#password');
  const confirm = $('#confirm');
  const agree = $('#agree');
  const message = $('#formMessage');

  function resetErrors() {
    $$('#registerForm .error').forEach(el => el.textContent = '');
    message.textContent = '';
  }

  function showError(id, text) {
    const el = $(`#err-${id}`);
    if (el) el.textContent = text;
  }

  function isEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault(); // always prevent default; we'll control submission
    resetErrors();
    let valid = true;

    // Fullname: required, at least 3 chars, letters+spaces
    const nameVal = fullname.value.trim();
    if (!nameVal || nameVal.length < 3 || !/^[A-Za-z\s]+$/.test(nameVal)) {
      showError('fullname', 'Please enter a valid name (3+ letters).');
      valid = false;
    }

    // Email
    const emailVal = email.value.trim();
    if (!isEmail(emailVal)) {
      showError('email', 'Enter a valid email address.');
      valid = false;
    }

    // Password: min 8 chars, at least one digit and one uppercase
    const pw = password.value;
    if (pw.length < 8 || !/\d/.test(pw) || !/[A-Z]/.test(pw)) {
      showError('password', 'Password must be 8+ chars, include a number and uppercase letter.');
      valid = false;
    }

    // Confirm
    if (confirm.value !== pw) {
      showError('confirm', 'Passwords do not match.');
      valid = false;
    }

    // Checkbox
    if (!agree.checked) {
      showError('agree', 'You must agree to the terms.');
      valid = false;
    }

    if (!valid) {
      message.textContent = 'Please fix the highlighted errors and try again.';
      message.style.color = '#b91c1c';
      return;
    }

    // Success: demonstration only (no server)
    message.textContent = 'Registration successful! (demo)';
    message.style.color = 'green';
    form.reset();
  });

  // UX: live validation feedback
  fullname.addEventListener('input', () => { if (fullname.value.trim().length >=3) $('#err-fullname').textContent=''; });
  email.addEventListener('input', () => { if (isEmail(email.value.trim())) $('#err-email').textContent=''; });
  password.addEventListener('input', () => { if (password.value.length >=8) $('#err-password').textContent=''; });
  confirm.addEventListener('input', () => { if (confirm.value === password.value) $('#err-confirm').textContent=''; });

  // Password toggle (re-usable)
  const toggle = $('#togglePwd');
  if (toggle) toggle.addEventListener('click', () => {
    if (password.type === 'password') { password.type = 'text'; toggle.textContent = '🙈'; }
    else { password.type = 'password'; toggle.textContent = '👁️'; }
  });
})();
