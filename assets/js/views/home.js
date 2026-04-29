/* ============================================================
   WC 2026 — Home View
   Phase: pre  → Countdown hero + tournament info
          live → Next match + live matches + standings preview
          post → Redirect to #ending
   ============================================================ */

import State from '../state.js';

// ── Helpers ──────────────────────────────────────────────────
function formatDate(d, locale = 'vi-VN') {
  if (!d) return '';
  return new Intl.DateTimeFormat(locale, {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh',
  }).format(d);
}

function pad(n) { return String(n).padStart(2, '0'); }

// ── Countdown ─────────────────────────────────────────────────
let _cdInterval = null;

function startCountdown(targetDate, elD, elH, elM, elS) {
  clearInterval(_cdInterval);

  function tick() {
    const diff = targetDate - Date.now();
    if (diff <= 0) {
      clearInterval(_cdInterval);
      [elD, elH, elM, elS].forEach(el => { if(el) el.textContent = '00'; });
      return;
    }
    const td = Math.floor(diff / 86400000);
    const th = Math.floor((diff % 86400000) / 3600000);
    const tm = Math.floor((diff % 3600000) / 60000);
    const ts = Math.floor((diff % 60000) / 1000);

    const vals = [pad(td), pad(th), pad(tm), pad(ts)];
    const els  = [elD, elH, elM, elS];
    els.forEach((el, i) => {
      if (el && el.textContent !== vals[i]) {
        el.textContent = vals[i];
        el.classList.remove('num-flip');
        void el.offsetWidth; // reflow
        el.classList.add('num-flip');
      }
    });
  }
  tick();
  _cdInterval = setInterval(tick, 1000);
}

// ── Match card helper ─────────────────────────────────────────
function matchCardHTML(m) {
  const isLive   = m.status === 'live';
  const isFin    = m.status === 'finished';
  const isPre    = m.status === 'upcoming';

  const badgeMap = {
    live:      `<span class="badge badge--live">Live ${m.minute ? m.minute+"'" : ''}</span>`,
    finished:  `<span class="badge badge--finished">FT</span>`,
    upcoming:  `<span class="badge badge--upcoming">Sắp tới</span>`,
    postponed: `<span class="badge badge--postponed">Hoãn</span>`,
  };

  const scoreBlock = (isLive || isFin) && m.score.home !== null
    ? `<div class="match-score">
        <span>${m.score.home}</span>
        <span class="match-score__sep">–</span>
        <span>${m.score.away}</span>
       </div>`
    : `<div class="match-score match-score--pending">${m.kickoffUtc ? new Intl.DateTimeFormat('vi-VN',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Ho_Chi_Minh'}).format(m.kickoffUtc) : 'TBD'}</div>`;

  return `
  <div class="match-card ${isLive ? 'match-card--live' : ''}">
    <div class="match-card__header">
      <span class="match-card__group">${m.group || m.round}</span>
      ${badgeMap[m.status] || ''}
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
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
        ${m.venue}
      </span>
      <span class="match-meta">${m.kickoffUtc ? formatDate(m.kickoffUtc) : ''}</span>
    </div>
  </div>`;
}

// ── PRE phase ─────────────────────────────────────────────────
function renderPre(config) {
  const startDate = new Date(config.tournament.startDate + 'T13:00:00-06:00');
  const el = document.createElement('div');
  el.innerHTML = `
    <div class="container">
      <div class="countdown-hero">
        <div class="countdown-hero__eyebrow">⚽ Đếm ngược đến trận khai mạc</div>
        <h1 class="countdown-hero__title">${config.tournament.name}</h1>
        <div class="countdown-units">
          <div class="countdown-unit">
            <span class="countdown-unit__num" id="cd-d">--</span>
            <span class="countdown-unit__label">Ngày</span>
          </div>
          <div class="countdown-unit">
            <span class="countdown-unit__num" id="cd-h">--</span>
            <span class="countdown-unit__label">Giờ</span>
          </div>
          <div class="countdown-unit">
            <span class="countdown-unit__num" id="cd-m">--</span>
            <span class="countdown-unit__label">Phút</span>
          </div>
          <div class="countdown-unit">
            <span class="countdown-unit__num" id="cd-s">--</span>
            <span class="countdown-unit__label">Giây</span>
          </div>
        </div>
        <div class="countdown-hero__hosts">
          <span class="host-badge"><span class="flag-emoji" role="img">🇺🇸</span> Hoa Kỳ</span>
          <span class="host-badge"><span class="flag-emoji" role="img">🇨🇦</span> Canada</span>
          <span class="host-badge"><span class="flag-emoji" role="img">🇲🇽</span> Mexico</span>
        </div>
      </div>

      <div class="section">
        <div class="overview-strip">
          <div class="info-card reveal">
            <div class="info-card__label">Tổng số đội</div>
            <div class="info-card__value">${config.tournament.totalTeams}</div>
            <div class="info-card__sub">Từ 6 liên đoàn trên thế giới</div>
          </div>
          <div class="info-card reveal">
            <div class="info-card__label">Tổng số trận đấu</div>
            <div class="info-card__value">${config.tournament.totalMatches}</div>
            <div class="info-card__sub">Từ vòng bảng đến chung kết</div>
          </div>
          <div class="info-card reveal">
            <div class="info-card__label">Khai mạc</div>
            <div class="info-card__value">11/6</div>
            <div class="info-card__sub">Mexico City — Mexico vs South Africa</div>
          </div>
          <div class="info-card reveal">
            <div class="info-card__label">Chung kết</div>
            <div class="info-card__value">19/7</div>
            <div class="info-card__sub">MetLife Stadium, New Jersey</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="group-header">
          <h3>Lịch thi đấu sắp tới</h3>
          <a href="#schedule" data-route="schedule" class="btn btn--ghost" style="margin-left:auto">Xem tất cả →</a>
        </div>
        <div id="upcoming-preview" class="grid-auto">
          <div class="match-card-skeleton">
            <div class="skeleton skel-box" style="height:14px;width:60%"></div>
            <div class="skeleton skel-box" style="height:40px;width:100%;margin-top:8px"></div>
          </div>
        </div>
      </div>
    </div>`;
  return el;
}

// ── LIVE phase ────────────────────────────────────────────────
function renderLive(matches) {
  const liveMatches     = matches.filter(m => m.status === 'live');
  const upcomingToday   = matches.filter(m => {
    if (m.status !== 'upcoming' || !m.kickoffUtc) return false;
    const today = new Date().toISOString().slice(0,10);
    return m.date === today;
  }).slice(0,4);
  const recentFinished  = matches.filter(m => m.status === 'finished')
    .sort((a,b) => (b.kickoffUtc||0) - (a.kickoffUtc||0)).slice(0,4);

  const el = document.createElement('div');
  el.innerHTML = `
    <div class="container">
      ${liveMatches.length ? `
        <div class="section">
          <div class="group-header">
            <h3>🔴 Đang diễn ra</h3>
            <span class="group-header__count">${liveMatches.length} trận</span>
          </div>
          <div class="grid-auto">${liveMatches.map(matchCardHTML).join('')}</div>
        </div>` : ''}

      ${upcomingToday.length ? `
        <div class="section">
          <div class="group-header">
            <h3>📅 Hôm nay</h3>
            <a href="#schedule" class="btn btn--ghost" style="margin-left:auto">Xem tất cả →</a>
          </div>
          <div class="grid-auto">${upcomingToday.map(matchCardHTML).join('')}</div>
        </div>` : ''}

      ${recentFinished.length ? `
        <div class="section">
          <div class="group-header">
            <h3>Kết quả gần nhất</h3>
            <a href="#results" class="btn btn--ghost" style="margin-left:auto">Xem tất cả →</a>
          </div>
          <div class="grid-auto">${recentFinished.map(matchCardHTML).join('')}</div>
        </div>` : ''}

      ${!liveMatches.length && !upcomingToday.length ? `
        <div class="empty-state" style="padding-top:var(--sp-8)">
          <div class="empty-state__icon">⚽</div>
          <h3>Không có trận đấu ngay lúc này</h3>
          <p>Kiểm tra lịch thi đấu để xem các trận tiếp theo.</p>
          <a href="#schedule" class="btn btn--primary" style="margin-top:var(--sp-4)">Xem lịch thi đấu</a>
        </div>` : ''}
    </div>`;
  return el;
}

// ── Render entry ─────────────────────────────────────────────
function render() {
  const { phase, config, matches } = State.get();

  if (phase === 'post') {
    window.WC_NAVIGATE('ending');
    return document.createElement('div');
  }

  if (phase === 'live') return renderLive(matches);
  return renderPre(config);
}

function afterMount() {
  const { phase, config, matches } = State.get();

  if (phase === 'pre' && config) {
    const startDate = new Date(config.tournament.startDate + 'T13:00:00-06:00');
    const elD = document.getElementById('cd-d');
    const elH = document.getElementById('cd-h');
    const elM = document.getElementById('cd-m');
    const elS = document.getElementById('cd-s');
    if (elD) startCountdown(startDate, elD, elH, elM, elS);
  }

  // Fill upcoming preview in pre-phase
  const preview = document.getElementById('upcoming-preview');
  if (preview && matches.length) {
    const first6 = matches.filter(m => m.status === 'upcoming').slice(0, 6);
    if (first6.length) {
      preview.innerHTML = first6.map(matchCardHTML).join('');
    } else {
      preview.innerHTML = `<div class="empty-state"><div class="empty-state__icon">📅</div><p>Chưa có dữ liệu lịch thi đấu.</p></div>`;
    }
  }
}

export default { render, afterMount };
