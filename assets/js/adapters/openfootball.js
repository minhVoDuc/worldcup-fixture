/* ============================================================
   WC 2026 — OpenFootball Adapter
   Normalizes worldcup.json → internal Match shape
   ============================================================ */

// Country name → emoji flag + short code
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
  'Scotland':            { flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', code: 'SCO' },
  'USA':                 { flag: '🇺🇸', code: 'USA' },
  'Argentina':           { flag: '🇦🇷', code: 'ARG' },
  'Germany':             { flag: '🇩🇪', code: 'GER' },
  'France':              { flag: '🇫🇷', code: 'FRA' },
  'England':             { flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', code: 'ENG' },
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
  'Morocco':             { flag: '🇲🇦', code: 'MAR' },
  'Ivory Coast':         { flag: '🇨🇮', code: 'CIV' },
  "Côte d'Ivoire":       { flag: '🇨🇮', code: 'CIV' },
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
  'Greece':              { flag: '🇬🇷', code: 'GRE' },
  'Romania':             { flag: '🇷🇴', code: 'ROU' },
  'Hungary':             { flag: '🇭🇺', code: 'HUN' },
  'Slovakia':            { flag: '🇸🇰', code: 'SVK' },
  'Austria':             { flag: '🇦🇹', code: 'AUT' },
  'Wales':               { flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', code: 'WAL' },
  'Ireland':             { flag: '🇮🇪', code: 'IRL' },
  'Iceland':             { flag: '🇮🇸', code: 'ISL' },
};

function getTeamMeta(name) {
  return TEAM_META[name] || { flag: '🏳️', code: name.slice(0,3).toUpperCase() };
}

// Parse "13:00 UTC-6" → UTC Date combined with a date string "2026-06-11"
function parseKickoff(dateStr, timeStr) {
  if (!timeStr || !dateStr) return null;
  try {
    const match = timeStr.match(/(\d{2}):(\d{2})\s*UTC([+-]\d+)/);
    if (!match) return null;
    const [, hh, mm, offset] = match;
    const offsetH = parseInt(offset, 10);
    // Convert local time to UTC
    const utcH = parseInt(hh, 10) - offsetH;
    const base = new Date(`${dateStr}T00:00:00Z`);
    base.setUTCHours(utcH, parseInt(mm, 10), 0, 0);
    return base;
  } catch { return null; }
}

// Determine match status relative to now
function inferStatus(kickoffUtc, score) {
  if (!kickoffUtc) return 'upcoming';
  const now = Date.now();
  const ko = kickoffUtc.getTime();
  const diff = now - ko;
  if (score && (score.home !== null || score.away !== null)) return 'finished';
  if (diff < 0) return 'upcoming';
  if (diff < 115 * 60 * 1000) return 'live'; // within ~115 min
  return 'finished';
}

function normalize(raw) {
  const matches = raw.matches || [];
  return matches.map((m, i) => {
    const kickoffUtc = parseKickoff(m.date, m.time);
    const isKnockout = !m.group;
    const homeScore = m.score1 !== undefined ? m.score1 : null;
    const awayScore = m.score2 !== undefined ? m.score2 : null;
    const score = { home: homeScore, away: awayScore };
    const status = inferStatus(kickoffUtc, score);
    const homeMeta = getTeamMeta(m.team1);
    const awayMeta = getTeamMeta(m.team2);
    return {
      id:         m.num || i + 1,
      round:      m.round || '',
      group:      m.group || '',
      date:       m.date || '',
      kickoffUtc,
      venue:      m.ground || '',
      homeTeam: { name: m.team1, flag: homeMeta.flag, code: homeMeta.code },
      awayTeam: { name: m.team2, flag: awayMeta.flag, code: awayMeta.code },
      score,
      status,
      isKnockout,
      rawTime:    m.time || '',
    };
  });
}

async function fetchMatches(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const raw = await res.json();
  return normalize(raw);
}

export default { fetchMatches, getTeamMeta, parseKickoff };
