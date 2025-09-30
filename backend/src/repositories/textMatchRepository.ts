import mongoose, { Schema, Document } from 'mongoose';

export interface ITextMatch extends Document {
    userId: string;
    name: string;
    email: string;
    cardName: string;
    attempts: number;
    timeSpent: number;
    finishedAt: Date;
}

const TextMatchSchema = new Schema<ITextMatch>({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    cardName: { type: String, required: true },
    attempts: { type: Number, required: true },
    timeSpent: { type: Number, required: true },
    finishedAt: { type: Date, default: Date.now },
});

// Índices para otimização de consultas
TextMatchSchema.index({ userId: 1, finishedAt: -1 });
TextMatchSchema.index({ attempts: 1, timeSpent: 1 }); // Para leaderboards

const TextMatchModel = mongoose.model<ITextMatch>('TextMatch', TextMatchSchema);

class TextMatchRepository {
    async saveTextMatch({ 
        userId, 
        name, 
        email, 
        cardName, 
        attempts, 
        timeSpent 
    }: Omit<ITextMatch, 'finishedAt' | '_id'>) {
        const match = new TextMatchModel({ 
            userId, 
            name, 
            email, 
            cardName, 
            attempts, 
            timeSpent 
        });
        await match.save();
    }

    async getUserTextMatches(userId: string) {
        return TextMatchModel.find({ userId }).sort({ finishedAt: -1 }).exec();
    }

    // Leaderboard baseado em menor número de tentativas
    async getTextLeaderboard(limit = 10) {
        return TextMatchModel.aggregate([
            {
                $group: {
                    _id: '$userId',
                    name: { $first: '$name' },
                    email: { $first: '$email' },
                    totalAttempts: { $sum: '$attempts' },
                    games: { $sum: 1 },
                    avgTimeSpent: { $avg: '$timeSpent' },
                },
            },
            { 
                $addFields: {
                    avgAttemptsPerGame: { $divide: ['$totalAttempts', '$games'] }
                }
            },
            { $sort: { avgAttemptsPerGame: 1, avgTimeSpent: 1 } },
            { $limit: limit },
        ]).exec();
    }

    // Leaderboard de velocidade para modo texto
    async getTextSpeedLeaderboard(limit = 10) {
        return TextMatchModel.aggregate([
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

    // Leaderboard de jogadas perfeitas (acertou na primeira tentativa)
    async getTextPerfectLeaderboard(limit = 10) {
        return TextMatchModel.aggregate([
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

    // Estatísticas do usuário no modo texto
    async getUserTextStats(userId: string) {
        const stats = await TextMatchModel.aggregate([
            {
                $match: { userId }
            },
            {
                $group: {
                    _id: null,
                    totalGames: { $sum: 1 },
                    totalAttempts: { $sum: '$attempts' },
                    totalTimeSpent: { $sum: '$timeSpent' },
                    avgAttempts: { $avg: '$attempts' },
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

export default new TextMatchRepository();