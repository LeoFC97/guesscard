import matchRepo from '../repositories/matchRepository';
import dailyMatchRepo from '../repositories/dailyMatchRepository';

export async function getUserStatsService(userId: string) {
    // Dias daily acertados
    const dailyMatches = await dailyMatchRepo.getPlayedDates(userId);
    const dailyStats = await dailyMatchRepo.getAllByUser(userId);
    // Partidas normais
    const matchRepoData = await matchRepo.getUserMatches(userId);
    // Recordes e médias
    let bestTries = null, bestTime = null, totalNormal = 0, totalDaily = 0;
    let sumTriesNormal = 0, sumTimeNormal = 0, sumTriesDaily = 0, sumTimeDaily = 0;
    if (Array.isArray(matchRepoData)) {
        totalNormal = matchRepoData.length;
        for (const m of matchRepoData) {
            sumTriesNormal += m.attempts;
            sumTimeNormal += m.timeSpent;
            if (bestTries === null || m.attempts < bestTries) bestTries = m.attempts;
            if (bestTime === null || m.timeSpent < bestTime) bestTime = m.timeSpent;
        }
    }
    if (Array.isArray(dailyStats)) {
        totalDaily = dailyStats.length;
        for (const d of dailyStats) {
            sumTriesDaily += d.attempts;
            sumTimeDaily += d.timeSpent;
            if (bestTries === null || d.attempts < bestTries) bestTries = d.attempts;
            if (bestTime === null || d.timeSpent < bestTime) bestTime = d.timeSpent;
        }
    }
    const avgTriesNormal = totalNormal ? (sumTriesNormal / totalNormal) : 0;
    const avgTimeNormal = totalNormal ? (sumTimeNormal / totalNormal) : 0;
    const avgTriesDaily = totalDaily ? (sumTriesDaily / totalDaily) : 0;
    const avgTimeDaily = totalDaily ? (sumTimeDaily / totalDaily) : 0;
    return {
        dailyDates: dailyMatches,
        stats: {
            totalNormal,
            totalDaily,
            bestTries,
            bestTime,
            avgTriesNormal: Number(avgTriesNormal.toFixed(2)),
            avgTimeNormal: Number(avgTimeNormal.toFixed(2)),
            avgTriesDaily: Number(avgTriesDaily.toFixed(2)),
            avgTimeDaily: Number(avgTimeDaily.toFixed(2)),
        }
    };
}
