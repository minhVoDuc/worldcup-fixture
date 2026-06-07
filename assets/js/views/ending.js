/* ============================================================
   WC 2026 — Ending View (Post-tournament)
   ============================================================ */
import State from '../state.js';
import { getMatchWinner, getMatchLoser } from '../utils/match-result.js';

function scoreLabel(match) {
  if (!match) return '';
  const { scoreFt, scoreEt, scorePen, hasEt, hasPen } = match;
  if (hasPen && scorePen && scoreFt) {
    const penStr = `${scorePen.home}–${scorePen.away} <span class="score-tag">PSO</span>`;
    const etStr  = scoreEt ? `${scoreEt.home}–${scoreEt.away} sau HP` : '';
    const ftStr  = `${scoreFt.home}–${scoreFt.away} sau 90'`;
    return [penStr, etStr, ftStr].filter(Boolean).join(' &nbsp;·&nbsp; ');
  }
  if (hasEt && scoreEt && scoreFt) {
    return `${scoreEt.home}–${scoreEt.away} <span class="score-tag">AET</span> &nbsp;·&nbsp; ${scoreFt.home}–${scoreFt.away} sau 90'`;
  }
  if (scoreFt) return `${scoreFt.home}–${scoreFt.away}`;
  return '';
}

function render() {
  const { matches, config } = State.get();
  const tournamentName = config?.tournament?.name || 'FIFA World Cup™';

  const finalMatch = matches.find(m => m.round === 'Final' && m.status === 'finished');
  const thirdMatch = matches.find(m => m.round === 'Match for third place' && m.status === 'finished');

  // ← dùng helper, không tự so sánh score nữa
  const champion = getMatchWinner(finalMatch);
  const runnerUp = getMatchLoser(finalMatch);
  const third    = getMatchWinner(thirdMatch);

  const finishedCount = matches.filter(m => m.status === 'finished').length;
  const totalGoals = matches
    .filter(m => m.status === 'finished' && m.scoreFt)
    .reduce((s, m) => {
      const base = m.scoreEt
        ? m.scoreEt.home + m.scoreEt.away
        : m.scoreFt.home + m.scoreFt.away;
      return s + base;
    }, 0);

  const finalScoreLabel = scoreLabel(finalMatch);

  const el = document.createElement('div');
  el.innerHTML = `
    <div class="ending-hero">
      <div class="ending-trophy">🏆</div>
      <h1 class="ending-title">${tournamentName}</h1>
      <p class="ending-subtitle">Giải đấu đã kết thúc</p>
      ${champion ? `
        <div class="ending-champ">${champion.flag} ${champion.name}</div>
        <p class="ending-champ-label">🥇 Nhà Vô Địch Thế Giới</p>
        <div class="star-row">
          <span class="star">⭐</span><span class="star">⭐</span>
          <span class="star">⭐</span><span class="star">⭐</span>
          <span class="star">⭐</span>
        </div>
        ${finalScoreLabel ? `<p class="ending-final-score">${finalScoreLabel}</p>` : ''}
      ` : `
        <p class="ending-subtitle" style="margin-top:var(--sp-4)">Nhà vô địch sẽ được cập nhật sau trận chung kết.</p>
      `}
    </div>

    <div class="container section">
      <div class="overview-strip">
        ${champion ? `<div class="info-card">
          <div class="info-card__label">🥇 Vô địch</div>
          <div class="info-card__value">${champion.flag} ${champion.name}</div>
        </div>` : ''}
        ${runnerUp ? `<div class="info-card">
          <div class="info-card__label">🥈 Á quân</div>
          <div class="info-card__value">${runnerUp.flag} ${runnerUp.name}</div>
        </div>` : ''}
        ${third ? `<div class="info-card">
          <div class="info-card__label">🥉 Hạng 3</div>
          <div class="info-card__value">${third.flag} ${third.name}</div>
        </div>` : ''}
        <div class="info-card">
          <div class="info-card__label">Tổng trận đấu</div>
          <div class="info-card__value">${finishedCount}</div>
          <div class="info-card__sub">trên tổng ${matches.length} trận</div>
        </div>
        <div class="info-card">
          <div class="info-card__label">Tổng bàn thắng</div>
          <div class="info-card__value">${totalGoals}</div>
          <div class="info-card__sub">${finishedCount ? (totalGoals / finishedCount).toFixed(2) : '–'} bàn/trận</div>
        </div>
      </div>
      <div style="text-align:center;margin-top:var(--sp-7)">
        <a href="#results"   class="btn btn--primary">Xem toàn bộ kết quả</a>
        <a href="#standings" class="btn btn--ghost"   style="margin-left:var(--sp-3)">BXH cuối cùng</a>
      </div>
    </div>`;
  return el;
}

export default { render };