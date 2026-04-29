/* ============================================================
   WC 2026 — App Entry Point
   ============================================================ */
import State      from './state.js';
import Router     from './router.js';
import DataSource from './data-source.js';

/* ── Theme toggle ─────────────────────────────────────────── */
function initTheme() {
  const html   = document.documentElement;
  const toggle = document.querySelector('[data-theme-toggle]');
  let theme    = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  html.setAttribute('data-theme', theme);
  updateToggleIcon(toggle, theme);
  toggle?.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', theme);
    updateToggleIcon(toggle, theme);
  });
}

function updateToggleIcon(btn, theme) {
  if (!btn) return;
  btn.setAttribute('aria-label', `Chuyển sang chế độ ${theme === 'dark' ? 'sáng' : 'tối'}`);
  btn.innerHTML = theme === 'dark'
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
}

/* ── Toast ────────────────────────────────────────────────── */
function showToast(msg, type = 'success', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}
window.WC_TOAST = showToast;

/* ── Last-updated ticker ──────────────────────────────────── */
function startLastUpdatedTicker() {
  const el = document.getElementById('last-updated');
  if (!el) return;
  setInterval(() => {
    const lu = State.get('lastUpdated');
    if (!lu) { el.textContent = ''; return; }
    const diffS = Math.floor((Date.now() - lu) / 1000);
    if (diffS < 60)       el.textContent = `Cập nhật ${diffS}s trước`;
    else if (diffS < 3600) el.textContent = `Cập nhật ${Math.floor(diffS / 60)}p trước`;
    else el.textContent = `Cập nhật ${new Intl.DateTimeFormat('vi-VN',{hour:'2-digit',minute:'2-digit'}).format(lu)}`;
  }, 5000);
}

/* ── Phase banner ─────────────────────────────────────────── */
function updatePhaseBanner() {
  const banner = document.getElementById('phase-banner');
  if (!banner) return;
  const phase = State.get('phase');
  if (phase === 'pre') {
    banner.className = 'phase-banner';
    banner.innerHTML = `<span class="phase-banner__dot" style="animation:none;background:var(--c-upcoming)"></span>
      Giải đấu chưa bắt đầu — Đang đếm ngược`;
    banner.style.display = 'flex';
  } else if (phase === 'live') {
    banner.className = 'phase-banner phase-banner--live';
    banner.innerHTML = `<span class="phase-banner__dot"></span>
      Giải đấu đang diễn ra — Dữ liệu cập nhật mỗi phút`;
    banner.style.display = 'flex';
  } else {
    banner.style.display = 'none';
  }
}

/* ── Init ─────────────────────────────────────────────────── */
async function init() {
  initTheme();

  let config;
  try {
    const res = await fetch('./data/config.json');
    config = await res.json();
  } catch {
    config = {
      tournament: {
        name: 'FIFA World Cup 2026™',
        startDate: '2026-06-11',
        endDate: '2026-07-19',
        totalTeams: 48,
        totalMatches: 104,
      },
      dataSource: 'openfootball',
      openfootball: {
        url: 'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json',
        refreshIntervalMs: 60000,
      },
    };
  }

  await DataSource.init(config);
  updatePhaseBanner();
  startLastUpdatedTicker();

  State.on('phase',       updatePhaseBanner);
  State.on('lastUpdated', () => {
    const el = document.getElementById('last-updated');
    if (el) el.textContent = 'Vừa cập nhật';
    showToast('Dữ liệu đã được cập nhật ✓', 'success', 2500);
  });

  Router.init();
}

document.addEventListener('DOMContentLoaded', init);
