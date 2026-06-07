/* ============================================================
   WC 2026 — Standings View  v1.2
   WC2026: 12 groups × 4 teams, top 2 + 8 best 3rd → Round of 32
   WC2022: 8 groups × 4 teams, top 2 → Round of 16
   → Tự detect từ số lượng groups trong data
   ============================================================ */
import State from '../state.js';

function toViGroup(g) { return g.replace(/^Group\s+/, 'Bảng '); }

function getQualifyCount(totalGroups) {
  // WC2026: 12 groups → top 2 + 8 best 3rd = 32 (hiển thị top 2 + note)
  // WC2022: 8 groups  → top 2 = 16
  return 2; // top 2 luôn qualify trực tiếp
}

function standingsTableHTML(groupKey, rows, totalGroups) {
  const label        = toViGroup(groupKey);
  const isWC2026     = totalGroups >= 12;
  const qualifyNote  = isWC2026
    ? '🟩 Top 2 vào thẳng &nbsp;·&nbsp; 🟨 Hạng 3 có thể vào vòng kế (8 đội tốt nhất)'
    : '🟩 Top 2 vào vòng kế tiếp';

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
          ${rows.map((r, i) => {
            let rowClass = '';
            if (i < 2)                   rowClass = 'qualify';
            else if (isWC2026 && i === 2) rowClass = 'qualify-maybe';
            return `
          <tr class="${rowClass}">
            <td>${i + 1}</td>
            <td><div class="standing-team">
              <span class="flag-emoji" role="img">${r.team.flag}</span>
              <span>${r.team.name}</span>
            </div></td>
            <td>${r.mp}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td>
            <td>${r.gf}</td><td>${r.ga}</td>
            <td>${r.gd >= 0 ? '+' + r.gd : r.gd}</td>
            <td class="pts-cell">${r.pts}</td>
          </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
    <p style="font-size:var(--text-xs);color:var(--c-text-light);margin-top:var(--sp-2);padding-left:var(--sp-1)">
      ${qualifyNote}
    </p>
  </div>`;
}

function buildContent(groupStandings, groupFilter) {
  const allGroups   = Object.keys(groupStandings).sort();
  const totalGroups = allGroups.length;
  const toShow      = groupFilter === 'all' ? allGroups : [groupFilter];
  return toShow
    .filter(g => groupStandings[g])
    .map(g => standingsTableHTML(g, groupStandings[g], totalGroups))
    .join('') ||
    `<div class="empty-state">
       <div class="empty-state__icon">📊</div>
       <h3>Chưa có dữ liệu</h3>
       <p>BXH sẽ được cập nhật sau khi các trận đấu bắt đầu.</p>
     </div>`;
}

function render() {
  const { groupStandings, filters } = State.get();
  const f         = filters.standings;
  const allGroups = Object.keys(groupStandings).sort();

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
  const select   = document.getElementById('standings-filter-group');
  const resetBtn = document.getElementById('standings-reset');
  if (!select) return;

  function applyFilter(group) {
    const { filters, groupStandings } = State.get();
    State.set({ filters: { ...filters, standings: { group } } });
    const content = document.getElementById('standings-content');
    if (content) content.innerHTML = buildContent(groupStandings, group);
    select.value = group;
    if (resetBtn) {
      const active = group !== 'all';
      resetBtn.style.opacity      = active ? '1'    : '.35';
      resetBtn.style.pointerEvents = active ? 'auto' : 'none';
    }
    if (window.WC_PARSE_FLAGS) window.WC_PARSE_FLAGS();
  }

  select.addEventListener('change', () => applyFilter(select.value));
  resetBtn?.addEventListener('click', () => applyFilter('all'));
}

export default { render, afterMount };
