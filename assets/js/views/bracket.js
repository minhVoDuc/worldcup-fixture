/* ============================================================
   WC 2026 — Bracket View  v2.0
   Rainbow drag scrollbar + connector lines + better sizing
   ============================================================ */
import State from '../state.js';

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

// Rainbow gradient stops — matches design system palette
const RAINBOW = [
  '#7FAE6E', // matcha
  '#B8D4A8', // matcha-light
  '#F9D94E', // gold
  '#F4A7B9', // pink
  '#7FAE6E', // loop back
];
const RAINBOW_CSS = `linear-gradient(90deg, ${RAINBOW.join(', ')})`;

function bracketMatchHTML(m) {
  const isFin  = m.status === 'finished';
  const isLive = m.status === 'live';
  const hWin   = isFin && m.score.home > m.score.away;
  const aWin   = isFin && m.score.away > m.score.home;
  const hScore = (isFin || isLive) && m.score.home !== null ? m.score.home : '';
  const aScore = (isFin || isLive) && m.score.away !== null ? m.score.away : '';
  const liveClass = isLive ? ' bracket-match--live' : '';

  return `
  <div class="bracket-match${liveClass}">
    <div class="bracket-match__header">
      ${isLive ? '<span class="bracket-live-dot"></span>' : ''}
      <span class="bracket-match__label">${m.id ? 'T' + m.id : '—'}</span>
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
        <!-- Custom rainbow scrollbar track -->
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

  // ── Thumb sizing & position ──────────────────────────────
  function updateThumb() {
    const ratio     = viewport.clientWidth / viewport.scrollWidth;
    const thumbW    = Math.max(ratio * track.clientWidth, 40);
    const scrollRatio = viewport.scrollLeft / (viewport.scrollWidth - viewport.clientWidth);
    const maxLeft   = track.clientWidth - thumbW;
    thumb.style.width = thumbW + 'px';
    thumb.style.transform = `translateX(${scrollRatio * maxLeft}px)`;

    // Hide track if not scrollable
    track.style.opacity = ratio >= 1 ? '0' : '1';
    track.style.pointerEvents = ratio >= 1 ? 'none' : 'auto';

    // Hide scroll hint after first scroll
    if (viewport.scrollLeft > 20 && hint) hint.style.opacity = '0';
  }

  // ── Rainbow animation on drag ────────────────────────────
  let isDragging   = false;
  let dragStartX   = 0;
  let dragScrollX  = 0;
  let rainbowAngle = 0;
  let rafId        = null;

  function setRainbow(active) {
    if (active) {
      // Animate rainbow gradient position
      cancelAnimationFrame(rafId);
      function animate() {
        rainbowAngle = (rainbowAngle + 1.5) % 360;
        const stops = RAINBOW.map((c, i) =>
          `${c} ${Math.round((i / (RAINBOW.length - 1)) * 100)}%`
        ).join(', ');
        thumb.style.background = `linear-gradient(${rainbowAngle}deg, ${stops})`;
        viewport.style.cursor = 'grabbing';
        if (isDragging) rafId = requestAnimationFrame(animate);
      }
      rafId = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(rafId);
      // Fade back to matcha gradient
      thumb.style.background = '';
      viewport.style.cursor = '';
    }
  }

  // Drag on viewport (mouse)
  viewport.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    isDragging  = true;
    dragStartX  = e.clientX;
    dragScrollX = viewport.scrollLeft;
    setRainbow(true);
    e.preventDefault();
  });
  document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartX;
    viewport.scrollLeft = dragScrollX - dx;
    updateThumb();
  });
  document.addEventListener('mouseup', () => {
    if (isDragging) { isDragging = false; setRainbow(false); }
  });

  // Touch drag
  let touchStartX  = 0;
  let touchScrollX = 0;
  viewport.addEventListener('touchstart', e => {
    touchStartX  = e.touches[0].clientX;
    touchScrollX = viewport.scrollLeft;
    setRainbow(true);
  }, { passive: true });
  viewport.addEventListener('touchmove', e => {
    const dx = e.touches[0].clientX - touchStartX;
    viewport.scrollLeft = touchScrollX - dx;
    updateThumb();
  }, { passive: true });
  viewport.addEventListener('touchend', () => setRainbow(false));

  // Scroll → update thumb
  viewport.addEventListener('scroll', updateThumb, { passive: true });

  // Drag on scrollbar thumb
  let thumbDrag = false;
  let thumbStartX = 0;
  let thumbScrollX = 0;
  thumb.addEventListener('mousedown', e => {
    thumbDrag    = true;
    thumbStartX  = e.clientX;
    thumbScrollX = viewport.scrollLeft;
    isDragging   = true;
    setRainbow(true);
    e.stopPropagation();
    e.preventDefault();
  });
  document.addEventListener('mousemove', e => {
    if (!thumbDrag) return;
    const trackW  = track.clientWidth;
    const thumbW  = thumb.clientWidth;
    const scrollW = viewport.scrollWidth - viewport.clientWidth;
    const ratio   = scrollW / (trackW - thumbW);
    viewport.scrollLeft = thumbScrollX + (e.clientX - thumbStartX) * ratio;
    updateThumb();
  });
  document.addEventListener('mouseup', () => {
    if (thumbDrag) { thumbDrag = false; isDragging = false; setRainbow(false); }
  });

  // Click on track → jump
  track.addEventListener('click', e => {
    if (e.target === thumb) return;
    const rect     = track.getBoundingClientRect();
    const clickX   = e.clientX - rect.left;
    const ratio    = clickX / track.clientWidth;
    viewport.scrollLeft = ratio * (viewport.scrollWidth - viewport.clientWidth);
    updateThumb();
  });

  // Parse flags
  if (window.WC_PARSE_FLAGS) window.WC_PARSE_FLAGS();

  // Initial state
  updateThumb();
  window.addEventListener('resize', updateThumb);
}

export default { render, afterMount };