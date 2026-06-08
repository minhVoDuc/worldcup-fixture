/* ============================================================
   WC 2026 — OpenFootball Adapter  v2.2
   ✅ WC2018 (UTC+3/4), WC2022 (UTC+3), WC2026 (UTC-4/5/6/7)
   ✅ Round name normalization: Quarter-finals → Quarter-final, etc.
   ✅ Score: ft / et / p (PSO)
   ============================================================ */

const TEAM_META = {
  'Mexico':              { flag: '🇲🇽', code: 'MEX' },
  'South Africa':        { flag: '🇿🇦', code: 'RSA' },
  'South Korea':         { flag: '🇰🇷', code: 'KOR' },
  'Czech Republic':      { flag: '🇨🇿', code: 'CZE' },
  'Canada':              { flag: '🇨🇦', code: 'CAN' },
  'Bosnia & Herzegovina':{ flag: '🇧🇦', code: 'BIH' },
  'Qatar':               { flag: '🇶🇦', code: 'QAT' },
  'Switzerland':         { flag: '🇨🇭', code: 'SUI' },
  'Brazil':              { flag: '🇧🇷', code: 'BRA' },
  'Morocco':             { flag: '🇲🇦', code: 'MAR' },
  'Haiti':               { flag: '🇭🇹', code: 'HAI' },
  'Scotland':            { flag: '<img src="https://flagcdn.com/w20/gb-sct.png" alt="Scotland" class="flag-img">', code: 'SCO' },
  'USA':                 { flag: '🇺🇸', code: 'USA' },
  'Argentina':           { flag: '🇦🇷', code: 'ARG' },
  'Germany':             { flag: '🇩🇪', code: 'GER' },
  'France':              { flag: '🇫🇷', code: 'FRA' },
  'England':             { flag: '<img src="https://flagcdn.com/w20/gb-eng.png" alt="England" class="flag-img">', code: 'ENG' },
  'Spain':               { flag: '🇪🇸', code: 'ESP' },
  'Portugal':            { flag: '🇵🇹', code: 'POR' },
  'Netherlands':         { flag: '🇳🇱', code: 'NED' },
  'Belgium':             { flag: '🇧🇪', code: 'BEL' },
  'Italy':               { flag: '🇮🇹', code: 'ITA' },
  'Japan':               { flag: '🇯🇵', code: 'JPN' },
  'Australia':           { flag: '🇦🇺', code: 'AUS' },
  'Nigeria':             { flag: '🇳🇬', code: 'NGA' },
  'Uruguay':             { flag: '🇺🇾', code: 'URU' },
  'Colombia':            { flag: '🇨🇴', code: 'COL' },
  'Ecuador':             { flag: '🇪🇨', code: 'ECU' },
  'Senegal':             { flag: '🇸🇳', code: 'SEN' },
  'Ghana':               { flag: '🇬🇭', code: 'GHA' },
  'Cameroon':            { flag: '🇨🇲', code: 'CMR' },
  'Tunisia':             { flag: '🇹🇳', code: 'TUN' },
  'Egypt':               { flag: '🇪🇬', code: 'EGY' },
  'Algeria':             { flag: '🇩🇿', code: 'ALG' },
  'Iran':                { flag: '🇮🇷', code: 'IRN' },
  'Saudi Arabia':        { flag: '🇸🇦', code: 'KSA' },
  'Poland':              { flag: '🇵🇱', code: 'POL' },
  'Croatia':             { flag: '🇭🇷', code: 'CRO' },
  'Serbia':              { flag: '🇷🇸', code: 'SRB' },
  'Denmark':             { flag: '🇩🇰', code: 'DEN' },
  'Sweden':              { flag: '🇸🇪', code: 'SWE' },
  'Norway':              { flag: '🇳🇴', code: 'NOR' },
  'Turkey':              { flag: '🇹🇷', code: 'TUR' },
  'Ukraine':             { flag: '🇺🇦', code: 'UKR' },
  'New Zealand':         { flag: '🇳🇿', code: 'NZL' },
  'Venezuela':           { flag: '🇻🇪', code: 'VEN' },
  'Paraguay':            { flag: '🇵🇾', code: 'PAR' },
  'Peru':                { flag: '🇵🇪', code: 'PER' },
  'Bolivia':             { flag: '🇧🇴', code: 'BOL' },
  'Chile':               { flag: '🇨🇱', code: 'CHI' },
  'Costa Rica':          { flag: '🇨🇷', code: 'CRC' },
  'Panama':              { flag: '🇵🇦', code: 'PAN' },
  'Jamaica':             { flag: '🇯🇲', code: 'JAM' },
  'Honduras':            { flag: '🇭🇳', code: 'HON' },
  'Cuba':                { flag: '🇨🇺', code: 'CUB' },
  "Côte d\'Ivoire":     { flag: '🇨🇮', code: 'CIV' },
  'Ivory Coast':         { flag: '🇨🇮', code: 'CIV' },
  'Mali':                { flag: '🇲🇱', code: 'MLI' },
  'DR Congo':            { flag: '🇨🇩', code: 'COD' },
  'Zambia':              { flag: '🇿🇲', code: 'ZAM' },
  'Zimbabwe':            { flag: '🇿🇼', code: 'ZIM' },
  'Angola':              { flag: '🇦🇴', code: 'ANG' },
  'Tanzania':            { flag: '🇹🇿', code: 'TAN' },
  'Uganda':              { flag: '🇺🇬', code: 'UGA' },
  'Kenya':               { flag: '🇰🇪', code: 'KEN' },
  'India':               { flag: '🇮🇳', code: 'IND' },
  'China':               { flag: '🇨🇳', code: 'CHN' },
  'Thailand':            { flag: '🇹🇭', code: 'THA' },
  'Vietnam':             { flag: '🇻🇳', code: 'VIE' },
  'Indonesia':           { flag: '🇮🇩', code: 'IDN' },
  'Philippines':         { flag: '🇵🇭', code: 'PHI' },
  'Malaysia':            { flag: '🇲🇾', code: 'MAS' },
  'Uzbekistan':          { flag: '🇺🇿', code: 'UZB' },
  'Russia':              { flag: '🇷🇺', code: 'RUS' },
  'Iceland':             { flag: '🇮🇸', code: 'ISL' },
  'Austria':             { flag: '🇦🇹', code: 'AUT' },
  'Wales':               { flag: '<img src="https://flagcdn.com/w20/gb-wls.png" alt="Wales" class="flag-img">', code: 'WAL' },
  'Panama':              { flag: '🇵🇦', code: 'PAN' },
  'Cape Verde':          { flag: '🇨🇻', code: 'CPV' },
  'Curaçao':             { flag: '🇨🇼', code: 'CUW' },
  'Iraq':                { flag: '🇮🇶', code: 'IRQ' },
  'Jordan':              { flag: '🇯🇴', code: 'JOR' },
};

function getTeamMeta(name) {
  return TEAM_META[name] || { flag: '🏳️', code: name.slice(0, 3).toUpperCase() };
}

// ── Round name normalizer ─────────────────────────────────────
// openfootball dùng plural (Quarter-finals, Semi-finals) ở 2018/2022
// nhưng singular ở 2026. Chuẩn hóa về singular để code nhất quán.
const ROUND_NORMALIZE = {
  'Quarter-finals': 'Quarter-final',
  'Semi-finals':    'Semi-final',
  'Matchday 1': 'Matchday 1', 'Matchday 2': 'Matchday 2', 'Matchday 3': 'Matchday 3',
  // fallthrough → giữ nguyên
};
function normalizeRound(round = '') {
  return ROUND_NORMALIZE[round] ?? round;
}

// ── Kickoff parser ────────────────────────────────────────────
// Hỗ trợ 3 format của openfootball:
//   "19:00"           → WC2022 Qatar (UTC+3), mặc định
//   "13:00 UTC+3"     → WC2018 Russia (UTC+3..+5)
//   "13:00 UTC-6"     → WC2026 USA/MEX/CAN (UTC-4..-7)
function parseKickoff(dateStr, timeStr) {
  if (!timeStr || !dateStr) return null;
  try {
    // "HH:MM UTC±N" — WC2018 hoặc WC2026
    const withOffset = timeStr.match(/^(\d{2}):(\d{2})\s*UTC([+-])(\d+)$/);
    if (withOffset) {
      const [, hh, mm, sign, offsetAbs] = withOffset;
      const offsetH = parseInt(offsetAbs, 10) * (sign === '+' ? 1 : -1);
      const utcH = parseInt(hh, 10) - offsetH;
      const base = new Date(`${dateStr}T00:00:00Z`);
      base.setUTCHours(utcH, parseInt(mm, 10), 0, 0);
      return base;
    }
    // "HH:MM" bare → Qatar UTC+3 (WC2022 default)
    const bare = timeStr.match(/^(\d{2}):(\d{2})$/);
    if (bare) {
      const [, hh, mm] = bare;
      return new Date(`${dateStr}T${hh}:${mm}:00+03:00`);
    }
    return null;
  } catch { return null; }
}

// ── Status inference ──────────────────────────────────────────
// Chỉ trả 'finished' khi có score thực tế.
// Nếu không có score nhưng thời gian đã qua → 'upcoming' (data chưa cập nhật).
function inferStatus(kickoffUtc, score) {
  if (!kickoffUtc) return 'upcoming';
  const now  = Date.now();
  const ko   = kickoffUtc.getTime();
  const diff = now - ko; // dương = đã qua

  const hasScore = score && (score.home !== null && score.away !== null);
  if (hasScore)                       return 'finished';
  if (diff < 0)                       return 'upcoming';
  if (diff < 115 * 60 * 1000)        return 'live';
  // Thời gian đã qua nhưng không có score (WC2026 fixture-only) → upcoming
  return 'upcoming';
}

// ── Normalize raw match → internal Match shape ────────────────
function normalize(raw) {
  const matches = raw.matches || [];
  return matches.map((m, i) => {
    const kickoffUtc = parseKickoff(m.date, m.time);
    const isKnockout = !m.group;
    const s = m.score || {};

    // Ưu tiên: penalty (PSO) > extra time (AET) > full time (FT)
    const homeScore = s.p?.[0] ?? s.et?.[0] ?? s.ft?.[0] ?? null;
    const awayScore = s.p?.[1] ?? s.et?.[1] ?? s.ft?.[1] ?? null;

    const scoreFt  = s.ft ? { home: s.ft[0], away: s.ft[1] } : null;
    const scoreEt  = s.et ? { home: s.et[0], away: s.et[1] } : null;
    const scorePen = s.p  ? { home: s.p[0],  away: s.p[1]  } : null;
    const hasEt    = !!s.et;
    const hasPen   = !!s.p;

    const score  = { home: homeScore, away: awayScore };
    const status = inferStatus(kickoffUtc, score);
    const homeMeta = getTeamMeta(m.team1);
    const awayMeta = getTeamMeta(m.team2);

    return {
      id:        m.num || i + 1,
      round:     normalizeRound(m.round || ''),  // ← chuẩn hóa ở đây
      group:     m.group || '',
      date:      m.date  || '',
      kickoffUtc,
      venue:     m.ground || '',
      homeTeam:  { name: m.team1, flag: homeMeta.flag, code: homeMeta.code },
      awayTeam:  { name: m.team2, flag: awayMeta.flag, code: awayMeta.code },
      score,
      scoreFt,
      scoreEt,
      scorePen,
      hasEt,
      hasPen,
      status,
      isKnockout,
      rawTime: m.time || '',
    };
  });
}

async function fetchMatches(url) {
  const res  = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const raw  = await res.json();
  return normalize(raw);
}

export default { fetchMatches, getTeamMeta, parseKickoff };
