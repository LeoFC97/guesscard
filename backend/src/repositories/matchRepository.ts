import mongoose, { Schema, Document } from 'mongoose';

export interface IMatch extends Document {
    userId: string;
    name: string;
    email: string;
    cardName: string;
    attempts: number;
    timeSpent: number;
    finishedAt: Date;
}

const MatchSchema = new Schema<IMatch>({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    cardName: { type: String, required: true },
    attempts: { type: Number, required: true },
    timeSpent: { type: Number, required: true },
    finishedAt: { type: Date, default: Date.now },
});

const MatchModel = mongoose.model<IMatch>('Match', MatchSchema);

class MatchRepository {
    async saveMatch({ userId, name, email, cardName, attempts, timeSpent }: Omit<IMatch, 'finishedAt' | '_id'>) {
        const match = new MatchModel({ userId, name, email, cardName, attempts, timeSpent });
        await match.save();
    }

    async getUserMatches(userId: string) {
        return MatchModel.find({ userId }).sort({ finishedAt: -1 }).exec();
    }

    async getLeaderboard(limit = 10) {
        // Exemplo: leaderboard por menor número de tentativas
        return MatchModel.aggregate([
            {
                $group: {
                    _id: '$userId',
                    name: { $first: '$name' },
                    email: { $first: '$email' },
                    totalAttempts: { $sum: '$attempts' },
                    games: { $sum: 1 },
                },
            },
            { $sort: { totalAttempts: 1 } },
            { $limit: limit },
        ]).exec();
    }
}

export default new MatchRepository();
