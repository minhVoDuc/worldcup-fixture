/* ============================================================
   WC 2026 — Schedule View
   Groups matches by date, filter by group / round
   ============================================================ */

import State from '../state.js';

function fmtDate(d) {
  return new Intl.DateTimeFormat('vi-VN', {
    weekday:'long', day:'numeric', month:'long', year:'numeric'
  }).format(d);
}
function fmtTime(d) {
  return new Intl.DateTimeFormat('vi-VN', {
    hour:'2-digit', minute:'2-digit', timeZone:'Asia/Ho_Chi_Minh'
  }).format(d);
}

function badgeHTML(m) {
  const map = {
    live:      `<span class="badge badge--live">LIVE ${m.minute ? m.minute+"'" : ''}</span>`,
    finished:  `<span class="badge badge--finished">KT</span>`,
    upcoming:  `<span class="badge badge--upcoming">Sắp tới</span>`,
    postponed: `<span class="badge badge--postponed">Hoãn</span>`,
  };
  return map[m.status] || '';
}

function matchCardHTML(m) {
  const isLive = m.status === 'live';
  const isFin  = m.status === 'finished';
  const scoreBlock = (isLive || isFin) && m.score.home !== null
    ? `<div class="match-score"><span>${m.score.home}</span><span class="match-score__sep">–</span><span>${m.score.away}</span></div>`
    : `<div class="match-score match-score--pending">${m.kickoffUtc ? fmtTime(m.kickoffUtc) : 'TBD'}</div>`;

  return `
  <div class="match-card ${isLive ? 'match-card--live' : ''}">
    <div class="match-card__header">
      <span class="match-card__group">${m.group || m.round}</span>
      ${badgeHTML(m)}
    </div>
    <div class="match-card__body">
      <div class="match-team">
        <span class="team-flag">${m.homeTeam.flag}</span>
        <span class="team-name">${m.homeTeam.name}</span>
      </div>
      ${scoreBlock}
      <div class="match-team match-team--away">
        <span class="team-flag">${m.awayTeam.flag}</span>
        <span class="team-name">${m.awayTeam.name}</span>
      </div>
    </div>
    <div class="match-card__footer">
      <span class="match-meta">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px"><path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
        ${m.venue}
      </span>
      ${m.kickoffUtc ? `<span class="match-meta">${fmtTime(m.kickoffUtc)}</span>` : ''}
    </div>
  </div>`;
}

function groupMatchesByDate(matches) {
  const map = {};
  for (const m of matches) {
    const key = m.date || 'Unknown';
    if (!map[key]) map[key] = [];
    map[key].push(m);
  }
  return Object.entries(map).sort(([a],[b]) => a.localeCompare(b));
}

function render() {
  const { matches, filters } = State.get();
  const f = filters.schedule;

  // Collect unique groups and rounds
  const groups = [...new Set(matches.filter(m=>m.group).map(m=>m.group))].sort();
  const rounds  = [...new Set(matches.map(m=>m.round).filter(Boolean))];

  // Apply filters
  let filtered = matches;
  if (f.group !== 'all') filtered = filtered.filter(m => m.group === f.group);
  if (f.round !== 'all') filtered = filtered.filter(m => m.round === f.round);

  const byDate = groupMatchesByDate(filtered);

  const el = document.createElement('div');
  el.innerHTML = `
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">Lịch Thi Đấu</h1>
        <p class="page-subtitle">${matches.length} trận — FIFA World Cup 2026™</p>
      </div>

      <div class="filter-bar" id="schedule-filters">
        <span class="filter-label">Bảng:</span>
        <button class="filter-chip ${f.group==='all'?'active':''}" data-filter-group="all">Tất cả</button>
        ${groups.map(g => `<button class="filter-chip ${f.group===g?'active':''}" data-filter-group="${g}">${g}</button>`).join('')}
        <span class="filter-label" style="margin-left:var(--sp-3)">Vòng:</span>
        <button class="filter-chip ${f.round==='all'?'active':''}" data-filter-round="all">Tất cả</button>
        ${[...new Set(rounds)].slice(0,8).map(r => `<button class="filter-chip ${f.round===r?'active':''}" data-filter-round="${r}">${r}</button>`).join('')}
      </div>

      <div id="schedule-list">
        ${byDate.length ? byDate.map(([date, ms]) => {
          const d = new Date(date + 'T12:00:00Z');
          return `
          <div class="section" style="padding-top:var(--sp-4);padding-bottom:var(--sp-4)">
            <div class="group-header">
              <h3>${fmtDate(d)}</h3>
              <span class="group-header__count">${ms.length} trận</span>
            </div>
            <div class="grid-auto">${ms.map(matchCardHTML).join('')}</div>
          </div>`;
        }).join('') : `
          <div class="empty-state">
            <div class="empty-state__icon">📅</div>
            <h3>Không tìm thấy trận đấu</h3>
            <p>Thử chọn bộ lọc khác.</p>
          </div>`}
      </div>
    </div>`;

  return el;
}

function afterMount() {
  const bar = document.getElementById('schedule-filters');
  if (!bar) return;
  bar.addEventListener('click', e => {
    const chip = e.target.closest('[data-filter-group],[data-filter-round]');
    if (!chip) return;
    const { filters } = State.get();
    const newFilters = { ...filters.schedule };
    if (chip.dataset.filterGroup !== undefined) newFilters.group = chip.dataset.filterGroup;
    if (chip.dataset.filterRound !== undefined) newFilters.round = chip.dataset.filterRound;
    State.set({ filters: { ...filters, schedule: newFilters } });

    // Re-render schedule list without full page reload
    const list = document.getElementById('schedule-list');
    if (!list) return;
    const { matches } = State.get();
    let filtered = matches;
    if (newFilters.group !== 'all') filtered = filtered.filter(m => m.group === newFilters.group);
    if (newFilters.round !== 'all') filtered = filtered.filter(m => m.round === newFilters.round);
    const byDate = groupMatchesByDate(filtered);
    list.innerHTML = byDate.length
      ? byDate.map(([date, ms]) => {
          const d = new Date(date + 'T12:00:00Z');
          const fmtDate2 = new Intl.DateTimeFormat('vi-VN',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(d);
          return `<div class="section" style="padding-top:var(--sp-4);padding-bottom:var(--sp-4)">
            <div class="group-header"><h3>${fmtDate2}</h3><span class="group-header__count">${ms.length} trận</span></div>
            <div class="grid-auto">${ms.map(matchCardHTML).join('')}</div>
          </div>`;
        }).join('')
      : `<div class="empty-state"><div class="empty-state__icon">📅</div><h3>Không tìm thấy trận đấu</h3><p>Thử chọn bộ lọc khác.</p></div>`;

    // Update chip active states
    bar.querySelectorAll('.filter-chip').forEach(c => {
      if (c.dataset.filterGroup !== undefined) c.classList.toggle('active', c.dataset.filterGroup === newFilters.group);
      if (c.dataset.filterRound !== undefined) c.classList.toggle('active', c.dataset.filterRound === newFilters.round);
    });
  });
}

function groupMatchesByDate(matches) {
  const map = {};
  for (const m of matches) {
    const key = m.date || 'Unknown';
    if (!map[key]) map[key] = [];
    map[key].push(m);
  }
  return Object.entries(map).sort(([a],[b]) => a.localeCompare(b));
}

export default { render, afterMount };
