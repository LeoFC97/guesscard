import matchRepo from '../repositories/matchRepository';
import dailyMatchRepo from '../repositories/dailyMatchRepository';

export async function getUserStatsService(userId: string) {
    // Dias daily acertados
    const dailyMatches = await dailyMatchRepo.getPlayedDates(userId);
    const dailyStats = await dailyMatchRepo.getAllByUser(userId);
    // Partidas normais
    const matchRepoData = await matchRepo.getUserMatches(userId);

    // Dados básicos do usuário
    let name = '', email = '';
    if (Array.isArray(matchRepoData) && matchRepoData.length > 0) {
        name = matchRepoData[0].name;
        email = matchRepoData[0].email;
    } else if (Array.isArray(dailyStats) && dailyStats.length > 0) {
        name = dailyStats[0].name;
        email = dailyStats[0].email;
    }

    // Recordes e médias
    let bestTries = null, bestTime = null, totalNormal = 0, totalDaily = 0;
    let sumTriesNormal = 0, sumTimeNormal = 0, sumTriesDaily = 0, sumTimeDaily = 0;
    let lastCard = '', lastDate = '', streak = 0;
    let cardsGuessed: { cardName: string, date: string }[] = [];

    if (Array.isArray(matchRepoData)) {
        totalNormal = matchRepoData.length;
        for (const m of matchRepoData) {
            sumTriesNormal += m.attempts;
            sumTimeNormal += m.timeSpent;
            if (bestTries === null || m.attempts < bestTries) bestTries = m.attempts;
            if (bestTime === null || m.timeSpent < bestTime) bestTime = m.timeSpent;
            // Última carta jogada
            if (
                !lastDate ||
                (m.finishedAt &&
                    new Date(m.finishedAt).getTime() > new Date(lastDate).getTime())
            ) {
                lastCard = m.cardName;
                lastDate = m.finishedAt instanceof Date ? m.finishedAt.toISOString() : m.finishedAt;
            }
            cardsGuessed.push({ cardName: m.cardName, date: m.finishedAt instanceof Date ? m.finishedAt.toISOString() : m.finishedAt });
        }
    }
    if (Array.isArray(dailyStats)) {
        totalDaily = dailyStats.length;
        for (const d of dailyStats) {
            sumTriesDaily += d.attempts;
            sumTimeDaily += d.timeSpent;
            if (bestTries === null || d.attempts < bestTries) bestTries = d.attempts;
            if (bestTime === null || d.timeSpent < bestTime) bestTime = d.timeSpent;
            // Última daily jogada
            if (!lastDate || (d.createdAt && d.createdAt > lastDate)) {
                lastCard = d.cardName;
                lastDate = d.createdAt;
            }
            cardsGuessed.push({ cardName: d.cardName, date: d.date });
        }
    }
    // Médias
    const avgTriesNormal = totalNormal ? (sumTriesNormal / totalNormal) : 0;
    const avgTimeNormal = totalNormal ? (sumTimeNormal / totalNormal) : 0;
    const avgTriesDaily = totalDaily ? (sumTriesDaily / totalDaily) : 0;
    const avgTimeDaily = totalDaily ? (sumTimeDaily / totalDaily) : 0;

    // Calcular streak (dias seguidos jogando daily)
    if (Array.isArray(dailyStats) && dailyStats.length > 0) {
        // Ordena por data decrescente
        const sorted = dailyStats.map(d => d.date).sort((a, b) => b.localeCompare(a));
        let currentStreak = 1;
        let prev = sorted[0];
        for (let i = 1; i < sorted.length; i++) {
            const prevDate = new Date(prev);
            const currDate = new Date(sorted[i]);
            prevDate.setDate(prevDate.getDate() - 1);
            if (prevDate.toISOString().slice(0, 10) === currDate.toISOString().slice(0, 10)) {
                currentStreak++;
                prev = sorted[i];
            } else {
                break;
            }
        }
        streak = currentStreak;
    }

    return {
        name: name || '',
        email: email || '',
        dailyDates: Array.isArray(dailyMatches) ? dailyMatches : [],
        stats: {
            totalNormal: totalNormal || 0,
            totalDaily: totalDaily || 0,
            bestTries: bestTries !== null && bestTries !== undefined ? bestTries : 0,
            bestTime: bestTime !== null && bestTime !== undefined ? bestTime : 0,
            avgTriesNormal: isNaN(avgTriesNormal) ? 0 : Number(avgTriesNormal.toFixed(2)),
            avgTimeNormal: isNaN(avgTimeNormal) ? 0 : Number(avgTimeNormal.toFixed(2)),
            avgTriesDaily: isNaN(avgTriesDaily) ? 0 : Number(avgTriesDaily.toFixed(2)),
            avgTimeDaily: isNaN(avgTimeDaily) ? 0 : Number(avgTimeDaily.toFixed(2)),
            lastCard: lastCard || '',
            lastDate: lastDate || '',
            streak: streak || 0,
            cardsGuessed: Array.isArray(cardsGuessed) ? cardsGuessed : []
        }
    };
}
