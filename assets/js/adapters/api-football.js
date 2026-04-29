/* ============================================================
   WC 2026 — API-Football Adapter (api-sports.io)
   Swap in by setting config.dataSource = "api-football"
   and providing config.apiFootball.apiKey
   ============================================================ */

function normalize(apiMatches) {
  return apiMatches.map(m => {
    const fixture   = m.fixture;
    const teams     = m.teams;
    const goals     = m.goals;
    const leagueRound = m.league?.round || '';
    const status    = fixture.status?.short;

    let normalStatus = 'upcoming';
    if (['FT','AET','PEN','AWD','WO'].includes(status)) normalStatus = 'finished';
    else if (['1H','HT','2H','ET','BT','P','SUSP','INT','LIVE'].includes(status)) normalStatus = 'live';
    else if (['PST','CANC'].includes(status)) normalStatus = 'postponed';

    return {
      id:         fixture.id,
      round:      leagueRound,
      group:      m.league?.name || '',
      date:       fixture.date ? fixture.date.split('T')[0] : '',
      kickoffUtc: fixture.date ? new Date(fixture.date) : null,
      venue:      fixture.venue?.name || '',
      homeTeam: {
        name: teams.home.name,
        flag: '🏳️',
        code: teams.home.name.slice(0,3).toUpperCase(),
        logo: teams.home.logo,
      },
      awayTeam: {
        name: teams.away.name,
        flag: '🏳️',
        code: teams.away.name.slice(0,3).toUpperCase(),
        logo: teams.away.logo,
      },
      score: {
        home: goals.home,
        away: goals.away,
      },
      status:     normalStatus,
      isKnockout: !leagueRound.toLowerCase().includes('group'),
      minute:     fixture.status?.elapsed || null,
    };
  });
}

async function fetchMatches(cfg) {
  const { baseUrl, leagueId, season, apiKey } = cfg;
  if (!apiKey) throw new Error('API-Football: apiKey not set in config.json');

  const res = await fetch(
    `${baseUrl}/fixtures?league=${leagueId}&season=${season}`,
    { headers: { 'x-apisports-key': apiKey } }
  );
  if (!res.ok) throw new Error(`API-Football HTTP ${res.status}`);
  const data = await res.json();
  return normalize(data.response || []);
}

export default { fetchMatches };
