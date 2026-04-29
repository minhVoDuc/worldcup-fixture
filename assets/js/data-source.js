/* ============================================================
   WC 2026 — Data Source Orchestrator
   - Detects tournament phase from config dates
   - Fetches from correct adapter
   - Computes group standings from match results
   - Keeps data fresh on interval
   ============================================================ */

import State from './state.js';
import OpenFootball from './adapters/openfootball.js';
import ApiFootball  from './adapters/api-football.js';

// ── Phase detection ───────────────────────────────────────────
function detectPhase(config) {
  const now   = Date.now();
  const start = new Date(config.tournament.startDate + 'T00:00:00').getTime();
  const end   = new Date(config.tournament.endDate   + 'T23:59:59').getTime();
  // Allow 1 day buffer for final ceremony
  if (now < start)       return 'pre';
  if (now > end + 86400000) return 'post';
  return 'live';
}

// ── Standings computation ─────────────────────────────────────
function computeStandings(matches) {
  const groups = {};

  // Init all teams from group-stage matches
  for (const m of matches) {
    if (!m.group) continue;
    const g = m.group;
    if (!groups[g]) groups[g] = {};
    for (const team of [m.homeTeam, m.awayTeam]) {
      if (!groups[g][team.name]) {
        groups[g][team.name] = {
          team,
          mp: 0, w: 0, d: 0, l: 0,
          gf: 0, ga: 0, gd: 0, pts: 0,
        };
      }
    }
  }

  // Process finished group-stage matches
  for (const m of matches) {
    if (!m.group || m.status !== 'finished') continue;
    if (m.score.home === null || m.score.away === null) continue;

    const g   = m.group;
    const hR  = groups[g][m.homeTeam.name];
    const aR  = groups[g][m.awayTeam.name];
    if (!hR || !aR) continue;

    const hg = m.score.home, ag = m.score.away;
    hR.mp++; aR.mp++;
    hR.gf += hg; hR.ga += ag;
    aR.gf += ag; aR.ga += hg;
    hR.gd = hR.gf - hR.ga;
    aR.gd = aR.gf - aR.ga;

    if (hg > ag)      { hR.w++; hR.pts += 3; aR.l++; }
    else if (hg < ag) { aR.w++; aR.pts += 3; hR.l++; }
    else              { hR.d++; hR.pts++; aR.d++; aR.pts++; }
  }

  // Sort each group: pts → gd → gf → name
  const sorted = {};
  for (const [grp, teamsObj] of Object.entries(groups)) {
    sorted[grp] = Object.values(teamsObj).sort((a, b) =>
      b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.team.name.localeCompare(b.team.name)
    );
  }
  return sorted;
}

// ── Main fetch ────────────────────────────────────────────────
let _refreshTimer = null;

async function loadData(config) {
  State.set({ loading: true, error: null });
  try {
    let matches;
    if (config.dataSource === 'api-football') {
      matches = await ApiFootball.fetchMatches(config.apiFootball);
    } else {
      matches = await OpenFootball.fetchMatches(config.openfootball.url);
    }

    const standings = computeStandings(matches);
    State.set({
      matches,
      groupStandings: standings,
      lastUpdated: new Date(),
      loading: false,
      error: null,
    });
  } catch (err) {
    console.error('[DataSource] Fetch error:', err);
    State.set({ loading: false, error: err.message });
  }
}

async function init(config) {
  const phase = detectPhase(config);
  State.set({ config, phase });

  await loadData(config);

  // Auto-refresh during live phase
  if (phase === 'live' && config.openfootball?.refreshIntervalMs) {
    clearInterval(_refreshTimer);
    _refreshTimer = setInterval(() => loadData(config), config.openfootball.refreshIntervalMs);
  }
}

export default { init, detectPhase, computeStandings };
