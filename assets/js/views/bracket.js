/* ============================================================
   WC 2026 — Bracket View  v2.1
   + Score tag PSO / AET cho trận hiệp phụ/penalty
   + Round of 32 đã có sẵn trong ROUND_ORDER
   ============================================================ */
import State from '../state.js';
import { getMatchWinner } from '../utils/match-result.js';

const ROUND_ORDER = [
  'Round of 32','Round of 16','Quarter-final',
  'Semi-final','Match for third place','Final',
];
const ROUND_LABELS = {
  'Round of 32':           'Vòng 1/16',
  'Round of 16':           'Vòng 1/8',
  'Quarter-final':         'Tứ kết',
  'Semi-final':            'Bán kết',
  'Match for third place': 'Tranh hạng 3',
  'Final':                 'Chung kết',
};

const RAINBOW = ['#7FAE6E','#B8D4A8','#F9D94E','#F4A7B9','#7FAE6E'];
const RAINBOW_CSS = `linear-gradient(90deg, ${RAINBOW.join(', ')})`;

function bracketMatchHTML(m) {
  const isFin  = m.status === 'finished';
  const isLive = m.status === 'live';

  // // Xác định winner đúng cho cả PSO
  // const hWin = isFin && (
  //   m.hasPen ? m.scorePen?.home > m.scorePen?.away
  //            : m.score.home > m.score.away
  // );
  // const aWin = isFin && (
  //   m.hasPen ? m.scorePen?.away > m.scorePen?.home
  //            : m.score.away > m.score.home
  // );
  // Xác định winner đúng cho cả PSO — dùng getMatchWinner
  const winner = isFin ? getMatchWinner(m) : null;
  const hWin = winner && winner.name === m.homeTeam.name;
  const aWin = winner && winner.name === m.awayTeam.name;

  // Điểm hiển thị: penalty shootout hoặc FT/AET
  let hScore = '', aScore = '', scoreTag = '';
  if (isFin || isLive) {
    if (m.hasPen && m.scorePen) {
      hScore   = m.scorePen.home;
      aScore   = m.scorePen.away;
      scoreTag = '<span class="bracket-score-tag">PSO</span>';
    } else if (m.hasEt && m.scoreEt) {
      hScore   = m.scoreEt.home;
      aScore   = m.scoreEt.away;
      scoreTag = '<span class="bracket-score-tag">AET</span>';
    } else if (m.score.home !== null) {
      hScore = m.score.home;
      aScore = m.score.away;
    }
  }

  // Sub-score: FT dưới PSO, hoặc FT dưới AET
  let subScore = '';
  if (isFin && m.hasPen && m.scoreEt) {
    subScore = `<div class="bracket-sub-score">${m.scoreEt.home}–${m.scoreEt.away} AET · ${m.scoreFt?.home ?? ''}–${m.scoreFt?.away ?? ''} FT</div>`;
  } else if (isFin && m.hasEt && m.scoreFt) {
    subScore = `<div class="bracket-sub-score">${m.scoreFt.home}–${m.scoreFt.away} FT</div>`;
  }

  const liveClass = isLive ? ' bracket-match--live' : '';
  return `
  <div class="bracket-match${liveClass}">
    <div class="bracket-match__header">
      ${isLive ? '<span class="bracket-live-dot"></span>' : ''}
      <span class="bracket-match__label">${m.id ? 'T' + m.id : '—'}</span>
      ${scoreTag}
    </div>
    <div class="bracket-team ${hWin ? 'bracket-team--winner' : ''}">
      <div class="bracket-team__name">
        <span class="flag-emoji" role="img">${m.homeTeam.flag || '🏳'}</span>
        <span>${m.homeTeam.name || '?'}</span>
      </div>
      <span class="bracket-team__score">${hScore}</span>
    </div>
    <div class="bracket-team ${aWin ? 'bracket-team--winner' : ''}">
      <div class="bracket-team__name">
        <span class="flag-emoji" role="img">${m.awayTeam.flag || '🏳'}</span>
        <span>${m.awayTeam.name || '?'}</span>
      </div>
      <span class="bracket-team__score">${aScore}</span>
    </div>
    ${subScore}
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

      <div class="bracket-scroll-hint" id="bracket-scroll-hint">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        Kéo ngang để xem toàn bộ nhánh đấu
      </div>

      ${roundKeys.length ? `
      <div class="bracket-outer" id="bracket-outer">
        <div class="bracket-scrollbar-track" id="bracket-track">
          <div class="bracket-scrollbar-thumb" id="bracket-thumb"></div>
        </div>
        <div class="bracket-viewport" id="bracket-viewport">
          <div class="bracket" id="bracket-inner">
            ${roundKeys.map(round => `
            <div class="bracket-round">
              <div class="bracket-round__label">${ROUND_LABELS[round] || round}</div>
              <div class="bracket-round__matches">
                ${byRound[round].map(bracketMatchHTML).join('')}
              </div>
            </div>`).join('')}
          </div>
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

function afterMount() {
  const viewport = document.getElementById('bracket-viewport');
  const thumb    = document.getElementById('bracket-thumb');
  const track    = document.getElementById('bracket-track');
  const hint     = document.getElementById('bracket-scroll-hint');
  if (!viewport || !thumb || !track) return;

  function updateThumb() {
    const ratio       = viewport.clientWidth / viewport.scrollWidth;
    const thumbW      = Math.max(ratio * track.clientWidth, 40);
    const scrollRatio = viewport.scrollLeft / (viewport.scrollWidth - viewport.clientWidth);
    const maxLeft     = track.clientWidth - thumbW;
    thumb.style.width     = thumbW + 'px';
    thumb.style.transform = `translateX(${scrollRatio * maxLeft}px)`;
    track.style.opacity      = ratio >= 1 ? '0' : '1';
    track.style.pointerEvents = ratio >= 1 ? 'none' : 'auto';
    if (viewport.scrollLeft > 20 && hint) hint.style.opacity = '0';
  }

  let isDragging = false, dragStartX = 0, dragScrollX = 0;
  let rainbowAngle = 0, rafId = null;

  function setRainbow(active) {
    if (active) {
      cancelAnimationFrame(rafId);
      function animate() {
        rainbowAngle = (rainbowAngle + 1.5) % 360;
        const stops = RAINBOW.map((c,i) => `${c} ${Math.round(i/(RAINBOW.length-1)*100)}%`).join(', ');
        thumb.style.background = `linear-gradient(${rainbowAngle}deg, ${stops})`;
        viewport.style.cursor = 'grabbing';
        if (isDragging) rafId = requestAnimationFrame(animate);
      }
      rafId = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(rafId);
      thumb.style.background = '';
      viewport.style.cursor  = '';
    }
  }

  viewport.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    isDragging = true; dragStartX = e.clientX; dragScrollX = viewport.scrollLeft;
    setRainbow(true); e.preventDefault();
  });
  document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    viewport.scrollLeft = dragScrollX - (e.clientX - dragStartX);
    updateThumb();
  });
  document.addEventListener('mouseup', () => { if (isDragging) { isDragging = false; setRainbow(false); } });

  let touchStartX = 0, touchScrollX = 0;
  viewport.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; touchScrollX = viewport.scrollLeft; setRainbow(true); }, { passive: true });
  viewport.addEventListener('touchmove',  e => { viewport.scrollLeft = touchScrollX - (e.touches[0].clientX - touchStartX); updateThumb(); }, { passive: true });
  viewport.addEventListener('touchend',   () => setRainbow(false));
  viewport.addEventListener('scroll', updateThumb, { passive: true });

  let thumbDrag = false, thumbStartX = 0, thumbScrollX = 0;
  thumb.addEventListener('mousedown', e => {
    thumbDrag = true; thumbStartX = e.clientX; thumbScrollX = viewport.scrollLeft;
    isDragging = true; setRainbow(true); e.stopPropagation(); e.preventDefault();
  });
  document.addEventListener('mousemove', e => {
    if (!thumbDrag) return;
    const ratio = (viewport.scrollWidth - viewport.clientWidth) / (track.clientWidth - thumb.clientWidth);
    viewport.scrollLeft = thumbScrollX + (e.clientX - thumbStartX) * ratio;
    updateThumb();
  });
  document.addEventListener('mouseup', () => { if (thumbDrag) { thumbDrag = false; isDragging = false; setRainbow(false); } });
  track.addEventListener('click', e => {
    if (e.target === thumb) return;
    const ratio = (e.clientX - track.getBoundingClientRect().left) / track.clientWidth;
    viewport.scrollLeft = ratio * (viewport.scrollWidth - viewport.clientWidth);
    updateThumb();
  });

  if (window.WC_PARSE_FLAGS) window.WC_PARSE_FLAGS();
  updateThumb();
  window.addEventListener('resize', updateThumb);
}

export default { render, afterMount };
