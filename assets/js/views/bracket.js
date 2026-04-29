/* ============================================================
   WC 2026 — Bracket View
   Knockout rounds: R32 → R16 → QF → SF → 3rd → Final
   ============================================================ */
import State from '../state.js';

const ROUND_ORDER = [
  'Round of 32','Round of 16','Quarter-final',
  'Semi-final','Match for third place','Final',
];
const ROUND_LABELS = {
  'Round of 32':          'Vòng 1/16',
  'Round of 16':          'Vòng 1/8',
  'Quarter-final':        'Tứ kết',
  'Semi-final':           'Bán kết',
  'Match for third place':'Tranh hạng 3',
  'Final':                'Chung kết',
};

function bracketMatchHTML(m) {
  const isFin  = m.status === 'finished';
  const isLive = m.status === 'live';
  const hWin   = isFin && m.score.home > m.score.away;
  const aWin   = isFin && m.score.away > m.score.home;
  const hScore = (isFin || isLive) && m.score.home !== null ? m.score.home : '';
  const aScore = (isFin || isLive) && m.score.away !== null ? m.score.away : '';
  return `
  <div class="bracket-match">
    <div class="bracket-match__num">${m.id ? 'Trận ' + m.id : m.round}</div>
    <div class="bracket-team ${hWin ? 'bracket-team--winner' : ''}">
      <div class="bracket-team__name">
        <span>${m.homeTeam.flag}</span>
        <span>${m.homeTeam.name || '?'}</span>
      </div>
      <span class="bracket-team__score">${hScore}</span>
    </div>
    <div class="bracket-team ${aWin ? 'bracket-team--winner' : ''}">
      <div class="bracket-team__name">
        <span>${m.awayTeam.flag}</span>
        <span>${m.awayTeam.name || '?'}</span>
      </div>
      <span class="bracket-team__score">${aScore}</span>
    </div>
  </div>`;
}

function render() {
  const { matches } = State.get();
  const knockout = matches.filter(m => m.isKnockout);
  const byRound  = {};
  for (const r of ROUND_ORDER) {
    const ms = knockout.filter(m => m.round === r);
    if (ms.length) byRound[r] = ms;
  }
  const roundKeys = ROUND_ORDER.filter(r => byRound[r]);

  const el = document.createElement('div');
  el.innerHTML = `
    <div class="container--wide">
      <div class="page-header">
        <h1 class="page-title">Nhánh Playoff</h1>
        <p class="page-subtitle">Vòng loại trực tiếp — ${knockout.length} trận</p>
      </div>
      ${roundKeys.length ? `
      <div class="bracket-wrapper">
        <div class="bracket">
          ${roundKeys.map(round => `
          <div class="bracket-round">
            <div class="bracket-round__label">${ROUND_LABELS[round] || round}</div>
            ${byRound[round].map(bracketMatchHTML).join('')}
          </div>`).join('')}
        </div>
      </div>` : `
      <div class="empty-state" style="padding:var(--sp-8) var(--sp-4)">
        <div class="empty-state__icon">🏆</div>
        <h3>Vòng knockout chưa bắt đầu</h3>
        <p>Nhánh đấu sẽ hiển thị sau khi vòng bảng kết thúc.</p>
      </div>`}
    </div>`;
  return el;
}

export default { render };
