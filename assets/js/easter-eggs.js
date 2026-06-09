/* ============================================================
   easter-eggs.js — MU Theme v3
   Export: initEasterEggs()
   Tích hợp:
     import { initEasterEggs } from './easter-eggs.js';
     initEasterEggs(); // gọi trong init() của app.js
   ============================================================ */

let muThemeActive = false;
let previousBaseTheme = null;

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
  const value = String(code || '').trim().toLowerCase();

  if (value !== 'mu') {
    return { ok: false, message: 'Sai secret code rồi 🤔' };
  }

  toggleMUTheme();
  return {
    ok: true,
    message: muThemeActive
      ? 'Manchester United vibes 🔴 đã bật'
      : 'MU theme đã tắt',
  };
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

/* ── Entry point ─────────────────────────────────────────────── */
export function initEasterEggs() {
  buildLauncher();
}
