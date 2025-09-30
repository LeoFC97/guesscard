import { Schema, model, Document } from 'mongoose';
import { CoinTransaction, UserCoins } from '../types/coins';

// Schema para transações de moedas
const coinTransactionSchema = new Schema<CoinTransaction>({
    userId: { type: String, required: true, index: true },
    type: { type: String, required: true, enum: ['earn', 'spend'] },
    amount: { type: Number, required: true, min: 0 },
    reason: { type: String, required: true },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
    metadata: { type: Schema.Types.Mixed }
});

// Schema para saldo de moedas do usuário
const userCoinsSchema = new Schema<UserCoins>({
    userId: { type: String, required: true, unique: true, index: true },
    balance: { type: Number, default: 0, min: 0 },
    totalEarned: { type: Number, default: 0, min: 0 },
    totalSpent: { type: Number, default: 0, min: 0 },
    lastUpdated: { type: Date, default: Date.now }
});

const CoinTransactionModel = model<CoinTransaction>('CoinTransaction', coinTransactionSchema);
const UserCoinsModel = model<UserCoins>('UserCoins', userCoinsSchema);

class CoinsRepository {
    // Obter saldo atual do usuário
    async getUserCoins(userId: string): Promise<UserCoins | null> {
        try {
            let userCoins = await UserCoinsModel.findOne({ userId });
            
            // Se o usuário não existe, criar com saldo inicial
            if (!userCoins) {
                userCoins = new UserCoinsModel({
                    userId,
                    balance: 0,
                    totalEarned: 0,
                    totalSpent: 0,
                    lastUpdated: new Date()
                });
                await userCoins.save();
            }
            
            return userCoins;
        } catch (error) {
            console.error('Error getting user coins:', error);
            throw error;
        }
    }

    // Adicionar moedas ao usuário
    async addCoins(userId: string, amount: number, reason: string, description?: string, metadata?: any): Promise<UserCoins> {
        try {
            // Buscar ou criar registro do usuário
            let userCoins = await this.getUserCoins(userId);
            if (!userCoins) {
                throw new Error('Failed to get or create user coins');
            }

            // Criar transação
            const transaction = new CoinTransactionModel({
                userId,
                type: 'earn',
                amount,
                reason,
                description,
                metadata,
                createdAt: new Date()
            });

            // Atualizar saldo do usuário
            userCoins.balance += amount;
            userCoins.totalEarned += amount;
            userCoins.lastUpdated = new Date();

            // Salvar em paralelo
            await Promise.all([
                transaction.save(),
                UserCoinsModel.updateOne({ userId }, userCoins)
            ]);

            return userCoins;
        } catch (error) {
            console.error('Error adding coins:', error);
            throw error;
        }
    }

    // Gastar moedas do usuário
    async spendCoins(userId: string, amount: number, reason: string, description?: string, metadata?: any): Promise<UserCoins> {
        try {
            const userCoins = await this.getUserCoins(userId);
            if (!userCoins) {
                throw new Error('User coins not found');
            }

            // Verificar se tem saldo suficiente
            if (userCoins.balance < amount) {
                throw new Error('Insufficient coin balance');
            }

            // Criar transação
            const transaction = new CoinTransactionModel({
                userId,
                type: 'spend',
                amount,
                reason,
                description,
                metadata,
                createdAt: new Date()
            });

            // Atualizar saldo do usuário
            userCoins.balance -= amount;
            userCoins.totalSpent += amount;
            userCoins.lastUpdated = new Date();

            // Salvar em paralelo
            await Promise.all([
                transaction.save(),
                UserCoinsModel.updateOne({ userId }, userCoins)
            ]);

            return userCoins;
        } catch (error) {
            console.error('Error spending coins:', error);
            throw error;
        }
    }

    // Obter histórico de transações do usuário
    async getCoinHistory(userId: string, limit: number = 50, offset: number = 0): Promise<CoinTransaction[]> {
        try {
            return await CoinTransactionModel
                .find({ userId })
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(offset)
                .exec();
        } catch (error) {
            console.error('Error getting coin history:', error);
            throw error;
        }
    }

    // Obter estatísticas de moedas do usuário
    async getUserCoinStats(userId: string) {
        try {
            const userCoins = await this.getUserCoins(userId);
            if (!userCoins) {
                return null;
            }

            const [earnedToday, spentToday] = await Promise.all([
                this.getDailyCoins(userId, 'earn'),
                this.getDailyCoins(userId, 'spend')
            ]);

            return {
                balance: userCoins.balance,
                totalEarned: userCoins.totalEarned,
                totalSpent: userCoins.totalSpent,
                earnedToday,
                spentToday,
                lastUpdated: userCoins.lastUpdated
            };
        } catch (error) {
            console.error('Error getting user coin stats:', error);
            throw error;
        }
    }

    // Obter moedas ganhas/gastas hoje
    private async getDailyCoins(userId: string, type: 'earn' | 'spend'): Promise<number> {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const result = await CoinTransactionModel.aggregate([
                {
                    $match: {
                        userId,
                        type,
                        createdAt: { $gte: today, $lt: tomorrow }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$amount' }
                    }
                }
            ]);

            return result.length > 0 ? result[0].total : 0;
        } catch (error) {
            console.error('Error getting daily coins:', error);
            return 0;
        }
    }

    // Resetar moedas do usuário (admin)
    async resetUserCoins(userId: string): Promise<UserCoins> {
        try {
            const userCoins = await UserCoinsModel.findOneAndUpdate(
                { userId },
                {
                    balance: 0,
                    totalEarned: 0,
                    totalSpent: 0,
                    lastUpdated: new Date()
                },
                { new: true, upsert: true }
            );

            return userCoins;
        } catch (error) {
            console.error('Error resetting user coins:', error);
            throw error;
        }
    }
}

const coinsRepository = new CoinsRepository();
export default coinsRepository;