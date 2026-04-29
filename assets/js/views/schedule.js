/* ============================================================
   WC 2026 — Schedule View  v1.3
   Filters: Bảng (dropdown) + Ngày (date strip / week nav)
   Round filter removed — Matchday N ≠ Lượt trận N
   ============================================================ */

import State from '../state.js';
import MatchModal from '../match-modal.js';

// ── Round label (for card header display only) ───────────────
const ROUND_LABEL = {
  'Round of 32':           'Vòng 1/16',
  'Round of 16':           'Vòng 1/8',
  'Quarter-final':         'Tứ kết',
  'Semi-final':            'Bán kết',
  'Match for third place': 'Tranh hạng 3',
  'Final':                 'Chung kết',
};

// ── Formatters ───────────────────────────────────────────────
function fmtDate(d) {
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  }).format(d);
}
function fmtDateShort(d) {
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'short', day: 'numeric', month: 'numeric'
  }).format(d);
}
function fmtTime(d) {
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh'
  }).format(d);
}

// Get VN date string "YYYY-MM-DD" from a UTC Date
function toVNDateKey(utcDate) {
  const vn = new Date(utcDate.getTime() + 7 * 3600 * 1000);
  return vn.toISOString().slice(0, 10);
}

// ── Badge ────────────────────────────────────────────────────
function badgeHTML(m) {
  const map = {
    live:      `<span class="badge badge--live">🔴 LIVE${m.minute ? ' ' + m.minute + "'" : ''}</span>`,
    finished:  `<span class="badge badge--finished">KT</span>`,
    upcoming:  `<span class="badge badge--upcoming">Sắp tới</span>`,
    postponed: `<span class="badge badge--postponed">Hoãn</span>`,
  };
  return map[m.status] || '';
}

// ── Match card ───────────────────────────────────────────────
function matchCardHTML(m) {
  const isLive = m.status === 'live';
  const isFin  = m.status === 'finished';
  const scoreBlock = (isLive || isFin) && m.score.home !== null
    ? `<div class="match-score"><span>${m.score.home}</span><span class="match-score__sep">–</span><span>${m.score.away}</span></div>`
    : `<div class="match-score match-score--pending">${m.kickoffUtc ? fmtTime(m.kickoffUtc) : 'TBD'}</div>`;

  const stageLabel = m.group
    ? 'Bảng ' + m.group.replace('Group ', '')
    : (ROUND_LABEL[m.round] || m.round);

  return `
  <div class="match-card ${isLive ? 'match-card--live' : ''}"
    data-match-id="${m.id}"
    tabindex="0"
    role="button"
    aria-label="Xem chi tiết: ${m.homeTeam.name} vs ${m.awayTeam.name}">
    <div class="match-card__header">
      <span class="match-card__group">${stageLabel}</span>
      ${badgeHTML(m)}
    </div>
    <div class="match-card__body">
      <div class="match-team">
        <span class="flag-emoji" role="img">${m.homeTeam.flag}</span>
        <span class="team-name">${m.homeTeam.name}</span>
      </div>
      ${scoreBlock}
      <div class="match-team match-team--away">
        <span class="flag-emoji" role="img">${m.awayTeam.flag}</span>
        <span class="team-name">${m.awayTeam.name}</span>
      </div>
    </div>
    <div class="match-card__footer">
      <span class="match-meta">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px">
          <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
          <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
        ${m.venue}
      </span>
      ${m.kickoffUtc ? `<span class="match-meta">${fmtTime(m.kickoffUtc)}</span>` : ''}
    </div>
  </div>`;
}

// ── Group by VN date ─────────────────────────────────────────
function groupByVNDate(matches) {
  const map = {};
  for (const m of matches) {
    const key = m.kickoffUtc ? toVNDateKey(m.kickoffUtc) : (m.date || 'Unknown');
    if (!map[key]) map[key] = [];
    map[key].push(m);
  }
  return Object.entries(map).sort(([a],[b]) => a.localeCompare(b));
}

// ── All unique VN date keys from matches ─────────────────────
function getAllVNDates(matches) {
  const set = new Set();
  for (const m of matches) {
    const key = m.kickoffUtc ? toVNDateKey(m.kickoffUtc) : (m.date || null);
    if (key) set.add(key);
  }
  return [...set].sort();
}

// ── Date strip HTML ──────────────────────────────────────────
function dateStripHTML(allDates, selectedDate) {
  return `
  <div class="date-strip-wrapper">
    <button class="date-nav-btn" id="date-nav-prev" aria-label="Tuần trước">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><polyline points="15 18 9 12 15 6"/></svg>
    </button>
    <div class="date-strip" id="date-strip">
      ${allDates.map(key => {
        const d = new Date(key + 'T00:00:00+07:00');
        const isActive = key === selectedDate;
        const dayNum  = d.toLocaleDateString('vi-VN', { day: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' });
        const dayName = d.toLocaleDateString('vi-VN', { weekday: 'short', timeZone: 'Asia/Ho_Chi_Minh' });
        const mon     = d.toLocaleDateString('vi-VN', { month: 'short', timeZone: 'Asia/Ho_Chi_Minh' });
        return `<button class="date-pill ${isActive ? 'active' : ''}" data-date="${key}">
          <span class="date-pill__day">${dayName}</span>
          <span class="date-pill__num">${dayNum}</span>
          <span class="date-pill__mon">${mon}</span>
        </button>`;
      }).join('')}
    </div>
    <button class="date-nav-btn" id="date-nav-next" aria-label="Tuần sau">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><polyline points="9 18 15 12 9 6"/></svg>
    </button>
  </div>`;
}

// ── Build match list HTML ─────────────────────────────────────
function buildList(matches, filters) {
  let filtered = matches;
  if (filters.group !== 'all') filtered = filtered.filter(m => m.group === filters.group);
  if (filters.date  !== 'all') {
    filtered = filtered.filter(m => {
      const key = m.kickoffUtc ? toVNDateKey(m.kickoffUtc) : m.date;
      return key === filters.date;
    });
  }
  const byDate = groupByVNDate(filtered);

  if (!byDate.length) return `
    <div class="empty-state">
      <div class="empty-state__icon">📅</div>
      <h3>Không tìm thấy trận đấu</h3>
      <p>Thử chọn bảng hoặc ngày khác.</p>
    </div>`;

  return byDate.map(([key, ms]) => {
    const d = new Date(key + 'T00:00:00+07:00');
    return `
    <div class="sched-day-group">
      <div class="group-header">
        <h3>${fmtDate(d)}</h3>
        <span class="group-header__count">${ms.length} trận</span>
      </div>
      <div class="grid-auto">${ms.map(matchCardHTML).join('')}</div>
    </div>`;
  }).join('');
}

// ── Render ────────────────────────────────────────────────────
function render() {
  const { matches, filters } = State.get();
  const f = filters.schedule;

  const groups   = [...new Set(matches.filter(m=>m.group).map(m=>m.group))].sort();
  const allDates = getAllVNDates(matches);

  const groupOptions = [
    { value: 'all', label: 'Tất cả các bảng' },
    ...groups.map(g => ({ value: g, label: g.replace('Group ', 'Bảng ') })),
  ];

  const el = document.createElement('div');
  el.innerHTML = `
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">Lịch Thi Đấu</h1>
        <p class="page-subtitle">${matches.length} trận — FIFA World Cup 2026™</p>
      </div>

      <!-- Row 1: Bảng dropdown + Reset -->
      <div class="sched-filter-row" id="schedule-filters">
        <div class="sched-dropdown-wrap">
          <label class="sched-dropdown-label" for="filter-group">
            <span style="font-size:.9rem">🏟️</span> Bảng
          </label>
          <div class="sched-dropdown-box">
            <select id="filter-group" class="sched-dropdown">
              ${groupOptions.map(o => `<option value="${o.value}" ${o.value===f.group?'selected':''}>${o.label}</option>`).join('')}
            </select>
            <svg class="sched-dropdown-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>
        <button class="sched-reset-btn" id="filter-reset"
          style="${f.group==='all'&&f.date==='all'?'opacity:.35;pointer-events:none':''}">
          ✕ Xoá lọc
        </button>
      </div>

      <!-- Row 2: Date strip -->
      <div id="date-strip-container">
        ${dateStripHTML(allDates, f.date)}
      </div>

      <!-- Match list -->
      <div id="schedule-list" style="margin-top:var(--sp-4)">
        ${buildList(matches, f)}
      </div>
    </div>`;

  return el;
}

// ── After mount ───────────────────────────────────────────────
function afterMount() {
  // Attach modal
  const _listEl = document.getElementById('schedule-list');
  if (_listEl) MatchModal.attachTo(_listEl);
  
  const { matches } = State.get();
  const allDates = getAllVNDates(matches);

  // Scroll active date pill into view
  function scrollActivePill() {
    const active = document.querySelector('.date-pill.active');
    if (active) active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }
  setTimeout(scrollActivePill, 80);

  function getFilters() {
    return {
      group: document.getElementById('filter-group')?.value || 'all',
      date:  (document.querySelector('.date-pill.active')?.dataset.date) || 'all',
    };
  }

  function applyFilters(newF) {
    const { filters } = State.get();
    State.set({ filters: { ...filters, schedule: newF } });

    // Update list
    document.getElementById('schedule-list').innerHTML = buildList(matches, newF);
    if (window.WC_PARSE_FLAGS) window.WC_PARSE_FLAGS();

    // Update date pills active state
    document.querySelectorAll('.date-pill').forEach(p => {
      p.classList.toggle('active', p.dataset.date === newF.date);
    });

    // Update reset btn
    const rst = document.getElementById('filter-reset');
    if (rst) {
      const active = newF.group !== 'all' || newF.date !== 'all';
      rst.style.opacity = active ? '1' : '.35';
      rst.style.pointerEvents = active ? 'auto' : 'none';
    }
  }

  // Group dropdown
  document.getElementById('filter-group')?.addEventListener('change', () => {
    applyFilters({ ...getFilters(), group: document.getElementById('filter-group').value });
  });

  // Date strip — click pill
  document.getElementById('date-strip')?.addEventListener('click', e => {
    const pill = e.target.closest('.date-pill');
    if (!pill) return;
    const newDate = pill.dataset.date === getFilters().date ? 'all' : pill.dataset.date; // toggle off if re-click
    applyFilters({ ...getFilters(), date: newDate });
    if (newDate !== 'all') pill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  });

  // Prev / Next week navigation
  let weekOffset = 0;
  const WEEK = 7;
  function updateStrip() {
    const strip = document.getElementById('date-strip');
    if (!strip) return;
    const start = weekOffset * WEEK;
    const visible = allDates.slice(start, start + WEEK);
    const curDate = getFilters().date;
    strip.innerHTML = visible.map(key => {
      const d = new Date(key + 'T00:00:00+07:00');
      const isActive = key === curDate;
      const dayNum  = d.toLocaleDateString('vi-VN', { day: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' });
      const dayName = d.toLocaleDateString('vi-VN', { weekday: 'short', timeZone: 'Asia/Ho_Chi_Minh' });
      const mon     = d.toLocaleDateString('vi-VN', { month: 'short', timeZone: 'Asia/Ho_Chi_Minh' });
      return `<button class="date-pill ${isActive ? 'active' : ''}" data-date="${key}">
        <span class="date-pill__day">${dayName}</span>
        <span class="date-pill__num">${dayNum}</span>
        <span class="date-pill__mon">${mon}</span>
      </button>`;
    }).join('');
    document.getElementById('date-nav-prev').disabled = weekOffset === 0;
    document.getElementById('date-nav-next').disabled = start + WEEK >= allDates.length;
  }

  // Init: show week containing today or first match
  const todayKey = toVNDateKey(new Date());
  const todayIdx = allDates.indexOf(todayKey);
  const nearIdx  = todayIdx >= 0 ? todayIdx : 0;
  weekOffset = Math.floor(nearIdx / WEEK);
  updateStrip();

  document.getElementById('date-nav-prev')?.addEventListener('click', () => {
    if (weekOffset > 0) { weekOffset--; updateStrip(); }
  });
  document.getElementById('date-nav-next')?.addEventListener('click', () => {
    if ((weekOffset + 1) * WEEK < allDates.length) { weekOffset++; updateStrip(); }
  });

  // Reset
  document.getElementById('filter-reset')?.addEventListener('click', () => {
    document.getElementById('filter-group').value = 'all';
    applyFilters({ group: 'all', date: 'all' });
  });
}

// function toVNDateKey(utcDate) {
//   const vn = new Date(utcDate.getTime() + 7 * 3600 * 1000);
//   return vn.toISOString().slice(0, 10);
// }

export default { render, afterMount };