/* ============================================================
   WC 2026 — Results View
   Shows finished matches sorted newest first, filter by group
   ============================================================ */

import State from '../state.js';
import MatchModal from '../match-modal.js';

function fmtDate(d) {
  return new Intl.DateTimeFormat('vi-VN', {
    weekday:'short', day:'numeric', month:'short',
    hour:'2-digit', minute:'2-digit', timeZone:'Asia/Ho_Chi_Minh'
  }).format(d);
}

function resultCardHTML(m) {
  return `
  <div class="match-card"
    data-match-id="${m.id}"
    tabindex="0"
    role="button"
    aria-label="Xem chi tiết: ${m.homeTeam.name} vs ${m.awayTeam.name}">
    <div class="match-card__header">
      <span class="match-card__group">${m.group || m.round}</span>
      <span class="badge badge--finished">Kết thúc</span>
    </div>
    <div class="match-card__body">
      <div class="match-team">
        <span class="flag-emoji" role="img">${m.homeTeam.flag}</span>
        <span class="team-name">${m.homeTeam.name}</span>
      </div>
      <div class="match-score">
        <span>${m.score.home}</span>
        <span class="match-score__sep">–</span>
        <span>${m.score.away}</span>
      </div>
      <div class="match-team match-team--away">
        <span class="flag-emoji" role="img">${m.awayTeam.flag}</span>
        <span class="team-name">${m.awayTeam.name}</span>
      </div>
    </div>
    <div class="match-card__footer">
      <span class="match-meta">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px"><path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
        ${m.venue}
      </span>
      <span class="match-meta">${m.kickoffUtc ? fmtDate(m.kickoffUtc) : m.date}</span>
    </div>
  </div>`;
}

function render() {
  const { matches, filters } = State.get();
  const f = filters.results;

  const finished = matches
    .filter(m => m.status === 'finished' && m.score.home !== null)
    .sort((a,b) => (b.kickoffUtc||0) - (a.kickoffUtc||0));

  const groups = [...new Set(finished.filter(m=>m.group).map(m=>m.group))].sort();
  const filtered = f.group !== 'all' ? finished.filter(m => m.group === f.group) : finished;

  const el = document.createElement('div');
  el.innerHTML = `
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">Kết Quả</h1>
        <p class="page-subtitle">${finished.length} trận đã hoàn thành</p>
      </div>

      <div class="filter-bar" id="results-filters">
        <span class="filter-label">Bảng:</span>
        <button class="filter-chip ${f.group==='all'?'active':''}" data-filter-group="all">Tất cả</button>
        ${groups.map(g => `<button class="filter-chip ${f.group===g?'active':''}" data-filter-group="${g}">${g}</button>`).join('')}
      </div>

      <div id="results-list">
        ${filtered.length
          ? `<div class="grid-auto">${filtered.map(resultCardHTML).join('')}</div>`
          : `<div class="empty-state">
               <div class="empty-state__icon">🏟️</div>
               <h3>Chưa có kết quả</h3>
               <p>Các kết quả sẽ được cập nhật sau khi trận đấu kết thúc.</p>
             </div>`}
      </div>
    </div>`;

  return el;
}

function afterMount() {
  const _rList = document.getElementById('results-list') || document.querySelector('.container');
  if (_rList) MatchModal.attachTo(_rList);
  const bar = document.getElementById('results-filters');
  if (!bar) return;
  bar.addEventListener('click', e => {
    const chip = e.target.closest('[data-filter-group]');
    if (!chip) return;
    const group = chip.dataset.filterGroup;
    const { filters, matches } = State.get();
    State.set({ filters: { ...filters, results: { ...filters.results, group } } });

    const finished = matches
      .filter(m => m.status === 'finished' && m.score.home !== null)
      .sort((a,b) => (b.kickoffUtc||0) - (a.kickoffUtc||0));
    const filtered = group !== 'all' ? finished.filter(m => m.group === group) : finished;

    const list = document.getElementById('results-list');
    if (list) {
      list.innerHTML = filtered.length
        ? `<div class="grid-auto">${filtered.map(resultCardHTML).join('')}</div>`
        : `<div class="empty-state"><div class="empty-state__icon">🏟️</div><h3>Chưa có kết quả</h3><p>Thử chọn bảng khác.</p></div>`;
    }
    bar.querySelectorAll('.filter-chip').forEach(c =>
      c.classList.toggle('active', c.dataset.filterGroup === group));
  });
}

export default { render, afterMount };
