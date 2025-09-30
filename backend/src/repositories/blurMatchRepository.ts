import mongoose, { Schema, Document } from 'mongoose';

export interface IBlurMatch extends Document {
    userId: string;
    name: string;
    email: string;
    cardName: string;
    attempts: number;
    timeSpent: number;
    blurAttempts: number; // Tentativas específicas do modo blur
    maxBlurAttempts: number; // Máximo de tentativas de blur permitidas
    finishedAt: Date;
}

const BlurMatchSchema = new Schema<IBlurMatch>({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    cardName: { type: String, required: true },
    attempts: { type: Number, required: true },
    timeSpent: { type: Number, required: true },
    blurAttempts: { type: Number, required: true },
    maxBlurAttempts: { type: Number, required: true, default: -1 }, // -1 = sem limite
    finishedAt: { type: Date, default: Date.now },
});

// Índices para otimização de consultas
BlurMatchSchema.index({ userId: 1, finishedAt: -1 });
BlurMatchSchema.index({ attempts: 1, timeSpent: 1 }); // Para leaderboards

const BlurMatchModel = mongoose.model<IBlurMatch>('BlurMatch', BlurMatchSchema);

class BlurMatchRepository {
    async saveBlurMatch({ 
        userId, 
        name, 
        email, 
        cardName, 
        attempts, 
        timeSpent, 
        blurAttempts, 
        maxBlurAttempts 
    }: Omit<IBlurMatch, 'finishedAt' | '_id'>) {
        const match = new BlurMatchModel({ 
            userId, 
            name, 
            email, 
            cardName, 
            attempts, 
            timeSpent, 
            blurAttempts, 
            maxBlurAttempts 
        });
        await match.save();
    }

    async getUserBlurMatches(userId: string) {
        return BlurMatchModel.find({ userId }).sort({ finishedAt: -1 }).exec();
    }

    // Leaderboard baseado em menor número de tentativas totais
    async getBlurLeaderboard(limit = 10) {
        return BlurMatchModel.aggregate([
            {
                $group: {
                    _id: '$userId',
                    name: { $first: '$name' },
                    email: { $first: '$email' },
                    totalAttempts: { $sum: '$attempts' },
                    totalBlurAttempts: { $sum: '$blurAttempts' },
                    games: { $sum: 1 },
                    avgTimeSpent: { $avg: '$timeSpent' },
                },
            },
            { 
                $addFields: {
                    avgAttemptsPerGame: { $divide: ['$totalAttempts', '$games'] },
                    avgBlurAttemptsPerGame: { $divide: ['$totalBlurAttempts', '$games'] }
                }
            },
            { $sort: { avgAttemptsPerGame: 1, avgTimeSpent: 1 } },
            { $limit: limit },
        ]).exec();
    }

    // Leaderboard de velocidade para modo blur
    async getBlurSpeedLeaderboard(limit = 10) {
        return BlurMatchModel.aggregate([
            {
                $group: {
                    _id: '$userId',
                    name: { $first: '$name' },
                    email: { $first: '$email' },
                    fastestTime: { $min: '$timeSpent' },
                    avgTime: { $avg: '$timeSpent' },
                    games: { $sum: 1 },
                },
            },
            { $sort: { fastestTime: 1 } },
            { $limit: limit },
        ]).exec();
    }

    // Leaderboard de jogadas perfeitas (acertou com mínimas tentativas)
    async getBlurPerfectLeaderboard(limit = 10) {
        return BlurMatchModel.aggregate([
            {
                $match: {
                    attempts: 1 // Apenas jogadas com 1 tentativa (acerto na primeira)
                }
            },
            {
                $group: {
                    _id: '$userId',
                    name: { $first: '$name' },
                    email: { $first: '$email' },
                    perfectGames: { $sum: 1 },
                    avgTimeSpent: { $avg: '$timeSpent' },
                    fastestPerfect: { $min: '$timeSpent' },
                },
            },
            { $sort: { perfectGames: -1, fastestPerfect: 1 } },
            { $limit: limit },
        ]).exec();
    }

    // Estatísticas do usuário no modo blur
    async getUserBlurStats(userId: string) {
        const stats = await BlurMatchModel.aggregate([
            {
                $match: { userId }
            },
            {
                $group: {
                    _id: null,
                    totalGames: { $sum: 1 },
                    totalAttempts: { $sum: '$attempts' },
                    totalBlurAttempts: { $sum: '$blurAttempts' },
                    totalTimeSpent: { $sum: '$timeSpent' },
                    avgAttempts: { $avg: '$attempts' },
                    avgBlurAttempts: { $avg: '$blurAttempts' },
                    avgTime: { $avg: '$timeSpent' },
                    fastestTime: { $min: '$timeSpent' },
                    perfectGames: {
                        $sum: {
                            $cond: [{ $eq: ['$attempts', 1] }, 1, 0]
                        }
                    }
                }
            }
        ]).exec();

        return stats[0] || null;
    }
}

export default new BlurMatchRepository();