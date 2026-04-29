/* ============================================================
   WC 2026 — Hash Router
   Routes: #home | #schedule | #results | #standings | #bracket | #ending
   ============================================================ */

import State from './state.js';

const ROUTES = ['home', 'schedule', 'results', 'standings', 'bracket', 'ending'];
const DEFAULT_ROUTE = 'home';

// Map route → view loader (lazy import)
const VIEW_LOADERS = {
  home:      () => import('./views/home.js'),
  schedule:  () => import('./views/schedule.js'),
  results:   () => import('./views/results.js'),
  standings: () => import('./views/standings.js'),
  bracket:   () => import('./views/bracket.js'),
  ending:    () => import('./views/ending.js'),
};

function getRoute() {
  const hash = window.location.hash.replace('#', '').trim();
  return ROUTES.includes(hash) ? hash : DEFAULT_ROUTE;
}

async function navigate(route) {
  if (!ROUTES.includes(route)) route = DEFAULT_ROUTE;

  // Update hash without scroll jump
  history.replaceState(null, '', '#' + route);

  State.set({ currentRoute: route });
  updateNavLinks(route);
  await renderView(route);
}

async function renderView(route) {
  const main = document.getElementById('view');
  if (!main) return;

  // Skeleton while loading view module
  main.innerHTML = `<div class="container section">
    ${[1,2,3].map(() => `
      <div class="match-card-skeleton">
        <div class="skel-row">
          <div class="skeleton skel-box" style="width:80px;height:14px"></div>
          <div class="skeleton skel-box" style="width:50px;height:14px;margin-left:auto"></div>
        </div>
        <div class="skel-row" style="align-items:center;justify-content:space-between">
          <div class="skeleton skel-box" style="width:100px;height:20px"></div>
          <div class="skeleton skel-box" style="width:60px;height:32px"></div>
          <div class="skeleton skel-box" style="width:100px;height:20px"></div>
        </div>
        <div class="skeleton skel-box" style="width:100%;height:12px;margin-top:4px"></div>
      </div>`).join('')}
  </div>`;

  try {
    const mod = await VIEW_LOADERS[route]();
    main.innerHTML = '';
    const el = mod.default.render();
    main.appendChild(el);
    main.firstElementChild?.classList.add('view-enter');
    if (mod.default.afterMount) mod.default.afterMount();
  } catch (err) {
    console.error('[Router] View load error:', err);
    main.innerHTML = `<div class="container section">
      <div class="empty-state">
        <div class="empty-state__icon">⚠️</div>
        <h3>Không thể tải trang</h3>
        <p>Vui lòng thử lại hoặc kiểm tra kết nối mạng.</p>
      </div>
    </div>`;
  }
}

function updateNavLinks(route) {
  document.querySelectorAll('[data-route]').forEach(el => {
    el.classList.toggle('active', el.dataset.route === route);
  });
}

function init() {
  window.addEventListener('hashchange', () => navigate(getRoute()));
  navigate(getRoute());
}

// Public navigate for views to call
window.WC_NAVIGATE = navigate;

export default { init, navigate };
