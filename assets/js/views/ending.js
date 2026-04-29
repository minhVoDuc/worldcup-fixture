/* ============================================================
   WC 2026 — Ending View (Post-tournament)
   ============================================================ */
import State from '../state.js';

function render() {
  const { matches } = State.get();
  const finalMatch = matches.find(m => m.round === 'Final' && m.status === 'finished');
  const thirdMatch = matches.find(m => m.round === 'Match for third place' && m.status === 'finished');

  let champion = null, runnerUp = null, third = null;
  if (finalMatch && finalMatch.score.home !== null) {
    if (finalMatch.score.home > finalMatch.score.away) {
      champion = finalMatch.homeTeam; runnerUp = finalMatch.awayTeam;
    } else {
      champion = finalMatch.awayTeam; runnerUp = finalMatch.homeTeam;
    }
  }
  if (thirdMatch && thirdMatch.score.home !== null) {
    third = thirdMatch.score.home > thirdMatch.score.away
      ? thirdMatch.homeTeam : thirdMatch.awayTeam;
  }

  const finishedCount = matches.filter(m => m.status === 'finished').length;
  const totalGoals    = matches
    .filter(m => m.status === 'finished' && m.score.home !== null)
    .reduce((s, m) => s + m.score.home + m.score.away, 0);

  const el = document.createElement('div');
  el.innerHTML = `
    <div class="ending-hero">
      <div class="ending-trophy">🏆</div>
      <h1 class="ending-title">FIFA World Cup 2026™</h1>
      <p style="font-size:var(--text-lg);color:var(--c-text-mid);margin-top:var(--sp-3)">Giải đấu đã kết thúc</p>
      ${champion ? `
        <div class="ending-champ">${champion.flag} ${champion.name}</div>
        <p style="color:var(--c-text-mid);font-size:var(--text-base);margin-top:var(--sp-2)">🥇 Nhà Vô Địch Thế Giới</p>
        <div class="star-row">
          <span class="star">⭐</span><span class="star">⭐</span>
          <span class="star">⭐</span><span class="star">⭐</span>
          <span class="star">⭐</span>
        </div>` : `
        <p style="color:var(--c-text-mid);margin-top:var(--sp-4)">Nhà vô địch sẽ được cập nhật sau trận chung kết.</p>`}
    </div>
    <div class="container section">
      <div class="overview-strip">
        ${champion ? `<div class="info-card"><div class="info-card__label">🥇 Vô địch</div>
          <div class="info-card__value">${champion.flag} ${champion.name}</div></div>` : ''}
        ${runnerUp ? `<div class="info-card"><div class="info-card__label">🥈 Á quân</div>
          <div class="info-card__value">${runnerUp.flag} ${runnerUp.name}</div></div>` : ''}
        ${third ? `<div class="info-card"><div class="info-card__label">🥉 Hạng 3</div>
          <div class="info-card__value">${third.flag} ${third.name}</div></div>` : ''}
        <div class="info-card">
          <div class="info-card__label">Tổng trận đấu</div>
          <div class="info-card__value">${finishedCount}</div>
          <div class="info-card__sub">trên tổng ${matches.length} trận</div>
        </div>
        <div class="info-card">
          <div class="info-card__label">Tổng bàn thắng</div>
          <div class="info-card__value">${totalGoals}</div>
          <div class="info-card__sub">${finishedCount ? (totalGoals/finishedCount).toFixed(2) : '–'} bàn/trận</div>
        </div>
      </div>
      <div style="text-align:center;margin-top:var(--sp-7)">
        <a href="#results"   class="btn btn--primary">Xem toàn bộ kết quả</a>
        <a href="#standings" class="btn btn--ghost" style="margin-left:var(--sp-3)">BXH cuối cùng</a>
      </div>
    </div>`;
  return el;
}

export default { render };
