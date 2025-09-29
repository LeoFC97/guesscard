import mongoose from 'mongoose';

// Importa os modelos diretamente
const MatchModel = mongoose.model('Match');
const DailyMatchModel = mongoose.model('DailyMatch');

export interface LeaderboardEntry {
    userId: string;
    name: string;
    email: string;
    totalGames: number;
    totalWins: number;
    winRate: number;
    averageAttempts: number;
    averageTime: number;
    bestTime: number;
    bestAttempts: number;
}

export interface DailyLeaderboardEntry {
    userId: string;
    name: string;
    email: string;
    totalDailyGames: number;
    currentStreak: number;
    longestStreak: number;
    averageAttempts: number;
    averageTime: number;
    bestTime: number;
    bestAttempts: number;
}

export class LeaderboardService {
    
    /**
     * Obtém leaderboard para jogos normais por dificuldade
     */
    public async getNormalLeaderboard(limit: number = 50): Promise<LeaderboardEntry[]> {
        try {
            // Agrega dados dos jogos normais (não diários)
            const results = await MatchModel.aggregate([
                {
                    $group: {
                        _id: { userId: "$userId", name: "$name", email: "$email" },
                        totalGames: { $sum: 1 },
                        averageAttempts: { $avg: "$attempts" },
                        averageTime: { $avg: "$timeSpent" },
                        bestTime: { $min: "$timeSpent" },
                        bestAttempts: { $min: "$attempts" }
                    }
                },
                {
                    $project: {
                        userId: "$_id.userId",
                        name: "$_id.name",
                        email: "$_id.email",
                        totalGames: 1,
                        totalWins: "$totalGames", // Todos os registros são vitórias
                        winRate: { $literal: 100 }, // 100% porque só salvamos vitórias
                        averageAttempts: { $round: ["$averageAttempts", 1] },
                        averageTime: { $round: ["$averageTime", 1] },
                        bestTime: 1,
                        bestAttempts: 1,
                        _id: 0
                    }
                },
                { $sort: { totalGames: -1, averageAttempts: 1, averageTime: 1 } },
                { $limit: limit }
            ]);
            
            return results;
        } catch (error) {
            console.error('Error getting normal leaderboard:', error);
            return [];
        }
    }

    /**
     * Obtém leaderboard para jogos diários
     */
    public async getDailyLeaderboard(limit: number = 50): Promise<DailyLeaderboardEntry[]> {
        try {
            // Agrega dados dos jogos diários
            const results = await DailyMatchModel.aggregate([
                {
                    $group: {
                        _id: { userId: "$userId", name: "$name", email: "$email" },
                        totalDailyGames: { $sum: 1 },
                        averageAttempts: { $avg: "$attempts" },
                        averageTime: { $avg: "$timeSpent" },
                        bestTime: { $min: "$timeSpent" },
                        bestAttempts: { $min: "$attempts" },
                        dates: { $push: "$date" }
                    }
                },
                {
                    $project: {
                        userId: "$_id.userId",
                        name: "$_id.name",
                        email: "$_id.email",
                        totalDailyGames: 1,
                        averageAttempts: { $round: ["$averageAttempts", 1] },
                        averageTime: { $round: ["$averageTime", 1] },
                        bestTime: 1,
                        bestAttempts: 1,
                        dates: 1,
                        _id: 0
                    }
                },
                { $sort: { totalDailyGames: -1, averageAttempts: 1, averageTime: 1 } },
                { $limit: limit }
            ]);

            // Calcula streaks para cada jogador
            const leaderboard = results.map((entry: any) => {
                const { currentStreak, longestStreak } = this.calculateStreaks(entry.dates);
                return {
                    userId: entry.userId,
                    name: entry.name,
                    email: entry.email,
                    totalDailyGames: entry.totalDailyGames,
                    currentStreak,
                    longestStreak,
                    averageAttempts: entry.averageAttempts,
                    averageTime: entry.averageTime,
                    bestTime: entry.bestTime,
                    bestAttempts: entry.bestAttempts
                };
            });

            return leaderboard;
        } catch (error) {
            console.error('Error getting daily leaderboard:', error);
            return [];
        }
    }

    /**
     * Obtém leaderboard de melhor tempo (speed run)
     */
    public async getSpeedLeaderboard(gameType: 'normal' | 'daily', limit: number = 50): Promise<any[]> {
        try {
            const Model = gameType === 'daily' ? DailyMatchModel : MatchModel;
            const results = await Model.aggregate([
                { $sort: { timeSpent: 1, attempts: 1 } }, // Menor tempo primeiro
                {
                    $group: {
                        _id: { userId: "$userId", name: "$name", email: "$email" },
                        bestTime: { $first: "$timeSpent" },
                        bestAttempts: { $first: "$attempts" },
                        bestDate: gameType === 'daily' ? { $first: "$date" } : { $first: "$createdAt" },
                        totalGames: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        userId: "$_id.userId",
                        name: "$_id.name",
                        email: "$_id.email",
                        bestTime: 1,
                        bestAttempts: 1,
                        bestDate: 1,
                        totalGames: 1,
                        _id: 0
                    }
                },
                { $sort: { bestTime: 1, bestAttempts: 1 } },
                { $limit: limit }
            ]);

            return results;
        } catch (error) {
            console.error('Error getting speed leaderboard:', error);
            return [];
        }
    }

    /**
     * Obtém leaderboard de menor número de tentativas (perfect run)
     */
    public async getPerfectLeaderboard(gameType: 'normal' | 'daily', limit: number = 50): Promise<any[]> {
        try {
            const Model = gameType === 'daily' ? DailyMatchModel : MatchModel;
            const results = await Model.aggregate([
                { $sort: { attempts: 1, timeSpent: 1 } }, // Menos tentativas primeiro
                {
                    $group: {
                        _id: { userId: "$userId", name: "$name", email: "$email" },
                        bestAttempts: { $first: "$attempts" },
                        bestTime: { $first: "$timeSpent" },
                        bestDate: gameType === 'daily' ? { $first: "$date" } : { $first: "$createdAt" },
                        totalGames: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        userId: "$_id.userId",
                        name: "$_id.name",
                        email: "$_id.email",
                        bestAttempts: 1,
                        bestTime: 1,
                        bestDate: 1,
                        totalGames: 1,
                        _id: 0
                    }
                },
                { $sort: { bestAttempts: 1, bestTime: 1 } },
                { $limit: limit }
            ]);

            return results;
        } catch (error) {
            console.error('Error getting perfect leaderboard:', error);
            return [];
        }
    }

    /**
     * Calcula streaks de dias consecutivos
     */
    private calculateStreaks(dates: string[]): { currentStreak: number; longestStreak: number } {
        if (!dates || dates.length === 0) {
            return { currentStreak: 0, longestStreak: 0 };
        }

        // Ordena as datas
        const sortedDates = [...new Set(dates)].sort();
        
        let currentStreak = 1;
        let longestStreak = 1;
        let tempStreak = 1;

        // Verifica se a sequência atual continua até hoje
        const today = new Date().toISOString().slice(0, 10);
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        
        const lastDate = sortedDates[sortedDates.length - 1];
        const isCurrentStreak = lastDate === today || lastDate === yesterday;

        // Calcula streaks
        for (let i = 1; i < sortedDates.length; i++) {
            const prevDate = new Date(sortedDates[i - 1]);
            const currDate = new Date(sortedDates[i]);
            const dayDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

            if (dayDiff === 1) {
                tempStreak++;
            } else {
                longestStreak = Math.max(longestStreak, tempStreak);
                tempStreak = 1;
            }
        }

        longestStreak = Math.max(longestStreak, tempStreak);
        currentStreak = isCurrentStreak ? tempStreak : 0;

        return { currentStreak, longestStreak };
    }
}

export default new LeaderboardService();