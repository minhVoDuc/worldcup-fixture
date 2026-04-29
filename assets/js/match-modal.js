/* ============================================================
   WC 2026 — Match Detail Modal  v1.0
   Usage: import MatchModal from '../match-modal.js';
          MatchModal.attachTo(containerEl);  // in afterMount()
   Desktop: horizontal | Mobile: vertical (≤ 480px)
   Close: backdrop · × · Escape
   ============================================================ */
import State from './state.js';

const ROUND_LABEL = {
  'Round of 32':           'Vòng 1/16',
  'Round of 16':           'Vòng 1/8',
  'Quarter-final':         'Tứ kết',
  'Semi-final':            'Bán kết',
  'Match for third place': 'Tranh hạng 3',
  'Final':                 'Chung kết',
};

function fmtDateTime(d) {
  return new Intl.DateTimeFormat('vi-VN', {
    weekday:'short', day:'numeric', month:'long',
    hour:'2-digit', minute:'2-digit', timeZone:'Asia/Ho_Chi_Minh',
  }).format(d);
}
function fmtTime(d) {
  return new Intl.DateTimeFormat('vi-VN', {
    hour:'2-digit', minute:'2-digit', timeZone:'Asia/Ho_Chi_Minh',
  }).format(d);
}

function statusBadge(m) {
  if (m.status === 'live')
    return `<span class="badge badge--live">🔴 LIVE${m.minute ? ' '+m.minute+"'" : ''}</span>`;
  if (m.status === 'finished')
    return `<span class="badge badge--finished">Kết thúc</span>`;
  if (m.status === 'postponed')
    return `<span class="badge badge--postponed">Hoãn</span>`;
  return `<span class="badge badge--upcoming">Sắp tới</span>`;
}

function buildModalHTML(m) {
  const isLive   = m.status === 'live';
  const isFin    = m.status === 'finished';
  const hasScore = (isLive || isFin) && m.score?.home !== null && m.score?.home !== undefined;
  const stageLabel = m.group
    ? 'Bảng ' + m.group.replace('Group ', '')
    : (ROUND_LABEL[m.round] || m.round || '');

  const scoreBlock = hasScore
    ? `<div class="mm-score">
         <span class="mm-score__num">${m.score.home}</span>
         <span class="mm-score__sep">–</span>
         <span class="mm-score__num">${m.score.away}</span>
       </div>`
    : `<div class="mm-time">${m.kickoffUtc ? fmtTime(m.kickoffUtc) : 'TBD'}</div>`;

  return `
<div class="mm-backdrop" id="mm-backdrop" role="dialog" aria-modal="true" aria-label="Chi tiết trận đấu">
  <div class="mm-card" id="mm-card">

    <button class="mm-close" id="mm-close" aria-label="Đóng">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>

    <div class="mm-stage">
      <span>${stageLabel}</span>
      ${statusBadge(m)}
    </div>

    <div class="mm-body">
      <div class="mm-team mm-team--home">
        <span class="mm-flag flag-emoji" role="img">${m.homeTeam.flag || '🏳'}</span>
        <span class="mm-name">${m.homeTeam.name}</span>
      </div>

      <div class="mm-centre">
        ${isLive ? '<span class="mm-live-dot"></span>' : ''}
        ${scoreBlock}
      </div>

      <div class="mm-team mm-team--away">
        <span class="mm-flag flag-emoji" role="img">${m.awayTeam.flag || '🏳'}</span>
        <span class="mm-name">${m.awayTeam.name}</span>
      </div>
    </div>

    <div class="mm-footer">
      <span class="mm-footer__item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13">
          <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
          <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
        ${m.venue || 'TBD'}
      </span>
      ${m.kickoffUtc ? `<span class="mm-footer__item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13">
          <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
        </svg>
        ${fmtDateTime(m.kickoffUtc)}
      </span>` : ''}
    </div>

  </div>
</div>`;
}

let _escHandler = null;

function open(matchId) {
  const { matches } = State.get();
  const m = matches.find(x => String(x.id) === String(matchId));
  if (!m) return;
  close(false);

  const wrapper = document.createElement('div');
  wrapper.innerHTML = buildModalHTML(m);
  document.body.appendChild(wrapper.firstElementChild);

  if (window.WC_PARSE_FLAGS) window.WC_PARSE_FLAGS();
  document.body.style.overflow = 'hidden';

  document.getElementById('mm-backdrop')?.addEventListener('click', e => {
    if (e.target.id === 'mm-backdrop') close();
  });
  document.getElementById('mm-close')?.addEventListener('click', close);

  _escHandler = e => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', _escHandler);

  requestAnimationFrame(() => document.getElementById('mm-close')?.focus());
}

function close(animate = true) {
  const backdrop = document.getElementById('mm-backdrop');
  if (!backdrop) return;
  if (animate) {
    const card = document.getElementById('mm-card');
    backdrop.style.animation = 'mmBackdropOut .18s ease forwards';
    if (card) card.style.animation = 'mmCardOut .18s cubic-bezier(0.4,0,1,1) forwards';
    setTimeout(() => backdrop.remove(), 190);
  } else {
    backdrop.remove();
  }
  document.body.style.overflow = '';
  if (_escHandler) { document.removeEventListener('keydown', _escHandler); _escHandler = null; }
}

function attachTo(containerEl) {
  if (!containerEl) return;
  containerEl.addEventListener('click', e => {
    const card = e.target.closest('.match-card[data-match-id]');
    if (card) open(card.dataset.matchId);
  });
  containerEl.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      const card = e.target.closest('.match-card[data-match-id]');
      if (card) { e.preventDefault(); open(card.dataset.matchId); }
    }
  });
}

export default { open, close, attachTo };