/* ============================================================
   easter-eggs.js — MU Theme v3
   Export: initEasterEggs()
   Tích hợp:
     import { initEasterEggs } from './easter-eggs.js';
     initEasterEggs(); // gọi trong init() của app.js
   ============================================================ */

let muThemeActive = false;
let previousBaseTheme = null;
let retroThemeActive = false;
let logoTapCount = 0;
let retroTapCount = 0;
let logoTapTimer = null;

/* ── Khóa / mở khóa base theme ─────────────────────────────── */
function lockBaseTheme() {
  const html = document.documentElement;
  previousBaseTheme = html.getAttribute('data-theme') || 'light';
  html.setAttribute('data-theme', 'light');
}

function restoreBaseTheme() {
  if (previousBaseTheme) {
    document.documentElement.setAttribute('data-theme', previousBaseTheme);
  }
  previousBaseTheme = null;
}

/* ── MU theme toggle ────────────────────────────────────────── */
function toggleMUTheme() {
  const html = document.documentElement;
  muThemeActive = !muThemeActive;

  if (muThemeActive) {
    lockBaseTheme();
    html.setAttribute('data-easter-theme', 'mu');
    toast('Manchester United vibes 🔴 đã bật');
    playEasterSound('./assets/sounds/manutd.mp3', 0.45);
  } else {
    html.removeAttribute('data-easter-theme');
    restoreBaseTheme();
    toast('Đã quay về theme mặc định');
  }
}

/* ── Toast helper ───────────────────────────────────────────── */
function toast(message, type = 'success', duration = 2400) {
  if (window.WC_TOAST) window.WC_TOAST(message, type, duration);
}

/* ── Xử lý secret code ──────────────────────────────────────── */
function runSecret(code) {
  if (['24/01', '08/07'].includes(String(code || '').trim())) {
    triggerBirthdayRain();
    return {
      ok: true,
      message: 'Happy birthday unlocked 🎂🎉',
    };
  }

  const value = String(code || '').trim().toLowerCase();

  if (value === 'babylele') {
    triggerBabyLele();
    return {
      ok: true,
      message: 'BABYLELE unlocked 🌈',
    };
  }

  if (value === '07/06/2026') {
    triggerLoveBloom();
    return {
      ok: true,
      message: 'Love bloom unlocked 💗🌷',
    };
  }
    
  if (value === 'babycrab') {
    triggerBabyCrab();
    return {
      ok: true,
      message: '🦀 Babycrab unlocked!',
    };
  }

  if (value === 'mu') {
    toggleMUTheme();
    return {
      ok: true,
      message: muThemeActive
        ? 'Manchester United vibes 🔴 đã bật'
        : 'MU theme đã tắt',
    };
  }

  return { ok: false, message: 'Sai secret code rồi 🤔' };
}

function triggerBabyLele() {
  document.querySelector('.babylele-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.className = 'babylele-overlay';
  overlay.innerHTML = `
    <div class="babylele-scene" aria-hidden="true">
      <div class="babylele-title">BABYLELE</div>
      <div class="babylele-rainbow">
        <span></span><span></span><span></span><span></span><span></span><span></span><span></span>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const sparkleLayer = document.createElement('div');
  sparkleLayer.className = 'babylele-sparkles';
  overlay.appendChild(sparkleLayer);

  for (let i = 0; i < 42; i++) {
    const sparkle = document.createElement('span');
    sparkle.textContent = Math.random() > 0.35 ? '✨' : '⭐';
    sparkle.style.left = `${8 + Math.random() * 84}%`;
    sparkle.style.top = `${12 + Math.random() * 72}%`;
    sparkle.style.fontSize = `${12 + Math.random() * 18}px`;
    sparkle.style.animationDelay = `${Math.random() * 2.5}s`;
    sparkle.style.animationDuration = `${1.4 + Math.random() * 1.8}s`;
    sparkleLayer.appendChild(sparkle);
  }

  setTimeout(() => {
    overlay.classList.add('is-leaving');
    setTimeout(() => overlay.remove(), 420);
  }, 10000);
}

function triggerBirthdayRain() {
  document.querySelector('.birthday-banner')?.remove();
  document.querySelector('.birthday-rain')?.remove();

  const banner = document.createElement('div');
  banner.className = 'birthday-banner';
  banner.innerHTML = 'HAPPY BIRTHDAY 🎂';

  const rain = document.createElement('div');
  rain.className = 'birthday-rain';

  document.body.appendChild(rain);
  document.body.appendChild(banner);
  playEasterSound('./assets/sounds/birthday.mp3', 0.45);

  const emojis = ['🎉', '🎁', '🥳', '✨', '🎈'];

  const createItem = () => {
    const item = document.createElement('span');
    item.className = 'birthday-item';
    item.textContent = emojis[Math.floor(Math.random() * emojis.length)];

    item.style.left = `${Math.random() * 100}vw`;
    item.style.fontSize = `${16 + Math.random() * 24}px`;

    const duration = `${4 + Math.random() * 4}s`;
    item.style.animationDuration = duration;
    item.style.setProperty('--birthday-duration', duration);

    item.style.opacity = `${0.55 + Math.random() * 0.45}`;
    item.style.setProperty('--birthday-sway', `${-36 + Math.random() * 72}px`);
    item.style.setProperty('--birthday-rotate', `${-180 + Math.random() * 360}deg`);

    rain.appendChild(item);
    setTimeout(() => item.remove(), 9000);
  };

  for (let i = 0; i < 32; i++) {
    setTimeout(createItem, i * 65);
  }

  const birthdayInterval = setInterval(createItem, 120);

  setTimeout(() => {
    clearInterval(birthdayInterval);
    banner.remove();
    setTimeout(() => rain.remove(), 9000);
  }, 7000);
}

function triggerLoveBloom() {
  document.querySelector('.lovebloom-banner')?.remove();
  document.querySelector('.lovebloom-rain')?.remove();

  const banner = document.createElement('div');
  banner.className = 'lovebloom-banner';
  banner.innerHTML = '💗 07/06/2026 💗';

  const rain = document.createElement('div');
  rain.className = 'lovebloom-rain';

  document.body.appendChild(rain);
  document.body.appendChild(banner);
  playEasterSound('./assets/sounds/love.mp3', 0.45);

  const emojis = ['💗', '🌷'];

  const createItem = () => {
    const item = document.createElement('span');
    item.className = 'lovebloom-item';

    item.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    item.style.left = `${Math.random() * 100}vw`;
    item.style.fontSize = `${16 + Math.random() * 24}px`;

    const duration = `${4 + Math.random() * 4}s`;
    item.style.animationDuration = duration;
    item.style.setProperty('--lovebloom-duration', duration);

    item.style.opacity = `${0.55 + Math.random() * 0.45}`;
    item.style.setProperty('--lovebloom-sway', `${-36 + Math.random() * 72}px`);
    item.style.setProperty('--lovebloom-rotate', `${-180 + Math.random() * 360}deg`);

    rain.appendChild(item);
    setTimeout(() => item.remove(), 9000);
  };

  for (let i = 0; i < 32; i++) {
    setTimeout(createItem, i * 65);
  }

  const bloomInterval = setInterval(createItem, 120);

  setTimeout(() => {
    clearInterval(bloomInterval);
    banner.remove();
    setTimeout(() => rain.remove(), 9000);
  }, 7000);
}

function triggerBabyCrab() {
  document.querySelector('.babycrab-banner')?.remove();
  document.querySelector('.babycrab-rain')?.remove();

  const rain = document.createElement('div');
  rain.className = 'babycrab-rain';

  document.body.appendChild(rain);
  playEasterSound('./assets/sounds/babycrab.mp3', 0.45);
  const createCrab = () => {
    const crab = document.createElement('span');
    crab.className = 'babycrab-item';
    crab.textContent = '🦀';

    crab.style.left = `${Math.random() * 100}vw`;
    crab.style.fontSize = `${16 + Math.random() * 22}px`;
    const duration = `${4 + Math.random() * 4}s`;
    crab.style.animationDuration = duration;
    crab.style.setProperty('--babycrab-duration', duration);
    crab.style.opacity = `${0.55 + Math.random() * 0.45}`;

    rain.appendChild(crab);
    setTimeout(() => crab.remove(), 9000);
  };

  for (let i = 0; i < 28; i++) {
    setTimeout(createCrab, i * 70);
  }

  const crabInterval = setInterval(createCrab, 130);

  setTimeout(() => {
    clearInterval(crabInterval);
    banner.remove();
    setTimeout(() => rain.remove(), 9000);
  }, 7000);
}

/* ── Dialog ─────────────────────────────────────────────────── */
function buildDialog() {
  const dialog = document.createElement('dialog');
  dialog.className = 'wc-ee-dialog';
  dialog.setAttribute('aria-label', 'Secret code');
  dialog.innerHTML = `
    <div class="wc-ee-card">
      <button type="button" class="wc-ee-close" data-ee-close aria-label="Đóng">✕</button>
      <p class="wc-ee-eyebrow">Hidden access</p>
      <h2 class="wc-ee-title">Enter secret code</h2>
      <p class="wc-ee-desc">Nhập đúng chuỗi để kích hoạt effect hoặc đổi theme.</p>
      <form class="wc-ee-form" autocomplete="off">
        <label class="wc-ee-label" for="wc-ee-input">Secret code</label>
        <input
          id="wc-ee-input"
          class="wc-ee-input"
          type="text"
          spellcheck="false"
          placeholder="Nhập secret code..."
        />
        <p class="wc-ee-feedback" aria-live="polite"></p>
        <div class="wc-ee-actions">
          <button type="submit" class="wc-ee-btn wc-ee-btn--primary">Kích hoạt</button>
          <button type="button" class="wc-ee-btn wc-ee-btn--ghost" data-ee-close>Đóng</button>
        </div>
      </form>
    </div>`;

  /* Đóng khi click backdrop hoặc nút data-ee-close */
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog || e.target.closest('[data-ee-close]')) {
      dialog.close();
    }
  });

  /* Reset form khi đóng */
  dialog.addEventListener('close', () => {
    dialog.querySelector('#wc-ee-input').value = '';
    const fb = dialog.querySelector('.wc-ee-feedback');
    fb.textContent = '';
    delete fb.dataset.state;
  });

  /* Submit */
  dialog.querySelector('.wc-ee-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = dialog.querySelector('#wc-ee-input');
    const fb    = dialog.querySelector('.wc-ee-feedback');
    const result = runSecret(input.value);
    fb.textContent  = result.message;
    fb.dataset.state = result.ok ? 'success' : 'error';
    if (result.ok) setTimeout(() => dialog.close(), 420);
  });

  document.body.appendChild(dialog);
  return dialog;
}

function openDialog() {
  const dialog = document.querySelector('.wc-ee-dialog') || buildDialog();
  if (!dialog.open) dialog.showModal();
  requestAnimationFrame(() => dialog.querySelector('#wc-ee-input')?.focus());
}

/* ── Launcher button ─────────────────────────────────────────── */
function buildLauncher() {
  if (document.querySelector('.wc-ee-launcher')) return;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'wc-ee-launcher';
  btn.setAttribute('aria-label', 'Mở secret code');
  btn.innerHTML = '<span aria-hidden="true">✦</span><span>Secret</span>';
  btn.addEventListener('click', openDialog);
  document.body.appendChild(btn);
}

function enableRetroTheme() {
  if (retroThemeActive) return;

  retroThemeActive = true;
  lockBaseTheme();

  document.documentElement.setAttribute('data-easter-theme', 'retro');
  toast('Retro mode unlocked 👾');
}

function disableRetroTheme() {
  if (!retroThemeActive) return;

  retroThemeActive = false;
  document.documentElement.removeAttribute('data-easter-theme');
  restoreBaseTheme();

  toast('Đã quay về theme mặc định');
}

function bindRetroLogoTap() {
  const logo = document.querySelector('.site-logo');
  if (!logo || logo.dataset.retroBound === 'true') return;

  logo.dataset.retroBound = 'true';
  logo.style.cursor = 'pointer';

  logo.addEventListener('click', () => {
    clearTimeout(logoTapTimer);
    logoTapTimer = setTimeout(() => {
      logoTapCount = 0;
      retroTapCount = 0;
    }, 1600);

    if (!retroThemeActive) {
      logoTapCount += 1;
      retroTapCount = 0;

      if (logoTapCount >= 7) {
        logoTapCount = 0;
        enableRetroTheme();
      }

      return;
    }

    retroTapCount += 1;
    logoTapCount = 0;

    if (retroTapCount >= 6) {
      retroTapCount = 0;
      disableRetroTheme();
    }
  });
}

function playEasterSound(src, volume = 0.45) {
  const audio = new Audio(src);
  audio.volume = volume;
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

/* ── Entry point ─────────────────────────────────────────────── */
export function initEasterEggs() {
  buildLauncher();
  bindRetroLogoTap();
}
