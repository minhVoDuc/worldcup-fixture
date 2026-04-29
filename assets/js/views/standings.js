/* ============================================================
   WC 2026 — Standings View
   ============================================================ */
import State from '../state.js';

function standingsTableHTML(groupName, rows) {
  return `
  <div style="margin-bottom:var(--sp-6)">
    <div class="group-header">
      <h3>${groupName}</h3>
      <span class="group-header__count">${rows.length} đội</span>
    </div>
    <div class="standings-table-wrap">
      <table class="standings-table" aria-label="Bảng xếp hạng ${groupName}">
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
              <span class="standing-flag">${r.team.flag}</span>
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
  return toShow.filter(g => groupStandings[g])
    .map(g => standingsTableHTML(g, groupStandings[g])).join('')
    || `<div class="empty-state">
          <div class="empty-state__icon">📊</div>
          <h3>Chưa có dữ liệu</h3>
          <p>BXH sẽ được cập nhật sau khi các trận đấu bắt đầu.</p>
        </div>`;
}

function render() {
  const { groupStandings, filters } = State.get();
  const f = filters.standings;
  const allGroups = Object.keys(groupStandings).sort();

  const el = document.createElement('div');
  el.innerHTML = `
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">Bảng Xếp Hạng</h1>
        <p class="page-subtitle">Vòng bảng — ${allGroups.length} bảng</p>
      </div>
      <div class="filter-bar" id="standings-filters">
        <span class="filter-label">Bảng:</span>
        <button class="filter-chip ${f.group==='all'?'active':''}" data-filter-group="all">Tất cả</button>
        ${allGroups.map(g => `<button class="filter-chip ${f.group===g?'active':''}" data-filter-group="${g}">${g}</button>`).join('')}
      </div>
      <div id="standings-content">${buildContent(groupStandings, f.group)}</div>
    </div>`;
  return el;
}

function afterMount() {
  const bar = document.getElementById('standings-filters');
  if (!bar) return;
  bar.addEventListener('click', e => {
    const chip = e.target.closest('[data-filter-group]');
    if (!chip) return;
    const group = chip.dataset.filterGroup;
    const { filters, groupStandings } = State.get();
    State.set({ filters: { ...filters, standings: { group } } });
    const content = document.getElementById('standings-content');
    if (content) content.innerHTML = buildContent(groupStandings, group);
    bar.querySelectorAll('.filter-chip').forEach(c =>
      c.classList.toggle('active', c.dataset.filterGroup === group));
  });
}

export default { render, afterMount };
