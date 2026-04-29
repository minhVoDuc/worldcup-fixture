/* ============================================================
   WC 2026 — Standings View  v1.1
   Filter bar matches schedule.js (dropdown + reset button)
   Group names: "Group A" → "Bảng A" throughout
   ============================================================ */
import State from '../state.js';

// "Group A" → "Bảng A"
function toViGroup(g) {
  return g.replace(/^Group\s+/, 'Bảng ');
}

function standingsTableHTML(groupKey, rows) {
  const label = toViGroup(groupKey);
  return `
  <div style="margin-bottom:var(--sp-6)">
    <div class="group-header">
      <h3>${label}</h3>
      <span class="group-header__count">${rows.length} đội</span>
    </div>
    <div class="standings-table-wrap">
      <table class="standings-table" aria-label="Bảng xếp hạng ${label}">
        <thead>
          <tr>
            <th>#</th><th>Đội</th>
            <th title="Số trận">ST</th><th title="Thắng">T</th>
            <th title="Hoà">H</th><th title="Thua">B</th>
            <th title="Bàn thắng">BT</th><th title="Bàn thua">BB</th>
            <th title="Hiệu số">HS</th><th title="Điểm">Đ</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((r, i) => `
          <tr class="${i < 2 ? 'qualify' : ''}">
            <td>${i + 1}</td>
            <td><div class="standing-team">
              <span class="flag-emoji" role="img">${r.team.flag}</span>
              <span>${r.team.name}</span>
            </div></td>
            <td>${r.mp}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td>
            <td>${r.gf}</td><td>${r.ga}</td>
            <td>${r.gd >= 0 ? '+' + r.gd : r.gd}</td>
            <td class="pts-cell">${r.pts}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <p style="font-size:var(--text-xs);color:var(--c-text-light);margin-top:var(--sp-2);padding-left:var(--sp-1)">
      🟩 Top 2 vào vòng kế tiếp
    </p>
  </div>`;
}

function buildContent(groupStandings, groupFilter) {
  const allGroups = Object.keys(groupStandings).sort();
  const toShow = groupFilter === 'all' ? allGroups : [groupFilter];
  return toShow
    .filter(g => groupStandings[g])
    .map(g => standingsTableHTML(g, groupStandings[g]))
    .join('') ||
    `<div class="empty-state">
       <div class="empty-state__icon">📊</div>
       <h3>Chưa có dữ liệu</h3>
       <p>BXH sẽ được cập nhật sau khi các trận đấu bắt đầu.</p>
     </div>`;
}

function render() {
  const { groupStandings, filters } = State.get();
  const f = filters.standings;
  const allGroups = Object.keys(groupStandings).sort();

  // Build same dropdown options as schedule.js
  const groupOptions = [
    { value: 'all', label: 'Tất cả các bảng' },
    ...allGroups.map(g => ({ value: g, label: toViGroup(g) })),
  ];

  const isFiltered = f.group !== 'all';

  const el = document.createElement('div');
  el.innerHTML = `
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">Bảng Xếp Hạng</h1>
        <p class="page-subtitle">Vòng bảng — ${allGroups.length} bảng</p>
      </div>

      <!-- Filter row: same pattern as schedule.js -->
      <div class="sched-filter-row" id="standings-filters">
        <div class="sched-dropdown-wrap">
          <label class="sched-dropdown-label" for="standings-filter-group">
            <span style="font-size:.9rem">🏟️</span> Bảng
          </label>
          <div class="sched-dropdown-box">
            <select id="standings-filter-group" class="sched-dropdown">
              ${groupOptions.map(o =>
                `<option value="${o.value}" ${o.value === f.group ? 'selected' : ''}>${o.label}</option>`
              ).join('')}
            </select>
            <svg class="sched-dropdown-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </div>
        <button class="sched-reset-btn" id="standings-reset"
          style="${isFiltered ? '' : 'opacity:.35;pointer-events:none'}">
          ✕ Xoá lọc
        </button>
      </div>

      <div id="standings-content">${buildContent(groupStandings, f.group)}</div>
    </div>`;
  return el;
}

function afterMount() {
  const select = document.getElementById('standings-filter-group');
  const resetBtn = document.getElementById('standings-reset');
  if (!select) return;

  function applyFilter(group) {
    const { filters, groupStandings } = State.get();
    State.set({ filters: { ...filters, standings: { group } } });

    // Update content
    const content = document.getElementById('standings-content');
    if (content) content.innerHTML = buildContent(groupStandings, group);

    // Sync dropdown value
    select.value = group;

    // Update reset button
    if (resetBtn) {
      const active = group !== 'all';
      resetBtn.style.opacity    = active ? '1'    : '.35';
      resetBtn.style.pointerEvents = active ? 'auto' : 'none';
    }

    // Parse flags
    if (window.WC_PARSE_FLAGS) window.WC_PARSE_FLAGS();
  }

  select.addEventListener('change', () => applyFilter(select.value));
  resetBtn?.addEventListener('click', () => applyFilter('all'));
}

export default { render, afterMount };