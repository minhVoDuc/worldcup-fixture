/* ============================================================
   match-result.js — Helper xác định winner/loser của 1 trận
   An toàn với PSO, AET, và trận bình thường
   ============================================================ */

/**
 * Trả về đội thắng của trận, hoặc null nếu hòa / chưa xong
 */
export function getMatchWinner(match) {
  if (!match || match.status !== 'finished') return null;

  // PSO: so sánh scorePen
  if (match.hasPen && match.scorePen) {
    if (match.scorePen.home === match.scorePen.away) return null;
    return match.scorePen.home > match.scorePen.away
      ? match.homeTeam : match.awayTeam;
  }

  // FT hoặc AET: dùng score tổng (đã là ET nếu có ET)
  const { home, away } = match.score;
  if (home === null || away === null) return null;
  if (home === away) return null;
  return home > away ? match.homeTeam : match.awayTeam;
}

/**
 * Trả về đội thua, hoặc null nếu hòa / chưa xong
 */
export function getMatchLoser(match) {
  const winner = getMatchWinner(match);
  if (!winner || !match) return null;
  return winner.name === match.homeTeam.name
    ? match.awayTeam : match.homeTeam;
}