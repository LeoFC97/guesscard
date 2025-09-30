import { Request, Response } from 'express';
import coinsRepository from '../repositories/coinsRepository';
import { COIN_REWARDS, COIN_COSTS } from '../types/coins';

export class CoinsController {

    // GET /api/coins/:userId - Obter saldo e informações do usuário
    public static async getUserCoins(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            
            if (!userId) {
                res.status(400).json({ message: 'userId é obrigatório' });
                return;
            }

            const userCoins = await coinsRepository.getUserCoins(userId);
            res.status(200).json(userCoins);
        } catch (error) {
            console.error('Error getting user coins:', error);
            res.status(500).json({ message: 'Erro ao buscar moedas do usuário', error });
        }
    }

    // GET /api/coins/:userId/stats - Obter estatísticas detalhadas
    public static async getUserCoinStats(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            
            if (!userId) {
                res.status(400).json({ message: 'userId é obrigatório' });
                return;
            }

            const stats = await coinsRepository.getUserCoinStats(userId);
            res.status(200).json(stats);
        } catch (error) {
            console.error('Error getting user coin stats:', error);
            res.status(500).json({ message: 'Erro ao buscar estatísticas de moedas', error });
        }
    }

    // POST /api/coins/add - Adicionar moedas ao usuário
    public static async addCoins(req: Request, res: Response): Promise<void> {
        try {
            const { userId, amount, reason, description, metadata } = req.body;
            
            if (!userId || !amount || !reason) {
                res.status(400).json({ 
                    message: 'userId, amount e reason são obrigatórios',
                    received: { userId, amount, reason }
                });
                return;
            }

            if (amount <= 0) {
                res.status(400).json({ message: 'Quantidade deve ser maior que zero' });
                return;
            }

            const userCoins = await coinsRepository.addCoins(userId, amount, reason, description, metadata);
            res.status(200).json({ 
                message: 'Moedas adicionadas com sucesso',
                userCoins,
                transaction: {
                    type: 'earn',
                    amount,
                    reason,
                    description
                }
            });
        } catch (error) {
            console.error('Error adding coins:', error);
            res.status(500).json({ message: 'Erro ao adicionar moedas', error });
        }
    }

    // POST /api/coins/spend - Gastar moedas do usuário
    public static async spendCoins(req: Request, res: Response): Promise<void> {
        try {
            const { userId, amount, reason, description, metadata } = req.body;
            
            if (!userId || !amount || !reason) {
                res.status(400).json({ 
                    message: 'userId, amount e reason são obrigatórios',
                    received: { userId, amount, reason }
                });
                return;
            }

            if (amount <= 0) {
                res.status(400).json({ message: 'Quantidade deve ser maior que zero' });
                return;
            }

            const userCoins = await coinsRepository.spendCoins(userId, amount, reason, description, metadata);
            res.status(200).json({ 
                message: 'Moedas gastas com sucesso',
                userCoins,
                transaction: {
                    type: 'spend',
                    amount,
                    reason,
                    description
                }
            });
        } catch (error) {
            console.error('Error spending coins:', error);
            
            if (error instanceof Error) {
                if (error.message === 'Insufficient coin balance') {
                    res.status(400).json({ message: 'Saldo insuficiente de moedas' });
                    return;
                }
            }
            
            res.status(500).json({ message: 'Erro ao gastar moedas', error });
        }
    }

    // GET /api/coins/:userId/history - Obter histórico de transações
    public static async getCoinHistory(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const limit = parseInt(req.query.limit as string) || 50;
            const offset = parseInt(req.query.offset as string) || 0;
            
            if (!userId) {
                res.status(400).json({ message: 'userId é obrigatório' });
                return;
            }

            const history = await coinsRepository.getCoinHistory(userId, limit, offset);
            res.status(200).json({ 
                history,
                pagination: {
                    limit,
                    offset,
                    total: history.length
                }
            });
        } catch (error) {
            console.error('Error getting coin history:', error);
            res.status(500).json({ message: 'Erro ao buscar histórico de moedas', error });
        }
    }



    // GET /api/coins/:userId/statement - Obter extrato completo de moedas
    public static async getCoinStatement(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const limit = parseInt(req.query.limit as string) || 100;
            const offset = parseInt(req.query.offset as string) || 0;
            
            if (!userId) {
                res.status(400).json({ message: 'userId é obrigatório' });
                return;
            }

            // Buscar dados do usuário e histórico em paralelo
            const [userCoins, history, stats] = await Promise.all([
                coinsRepository.getUserCoins(userId),
                coinsRepository.getCoinHistory(userId, limit, offset),
                coinsRepository.getUserCoinStats(userId)
            ]);

            if (!userCoins || !stats) {
                res.status(404).json({ message: 'Dados de moedas não encontrados para este usuário' });
                return;
            }

            // Organizar transações por data
            const transactionsByDate: Record<string, any[]> = {};
            history.forEach(transaction => {
                const date = new Date(transaction.createdAt).toISOString().slice(0, 10);
                if (!transactionsByDate[date]) {
                    transactionsByDate[date] = [];
                }
                transactionsByDate[date].push({
                    ...transaction,
                    formattedTime: new Date(transaction.createdAt).toLocaleTimeString('pt-BR'),
                    displayAmount: transaction.type === 'earn' ? `+${transaction.amount}` : `-${transaction.amount}`,
                    icon: transaction.type === 'earn' ? '💰' : '💸'
                });
            });

            // Estatísticas resumidas
            const summary = {
                currentBalance: userCoins.balance,
                totalEarned: stats.totalEarned,
                totalSpent: stats.totalSpent,
                earnedToday: stats.earnedToday,
                spentToday: stats.spentToday,
                lastUpdated: userCoins.lastUpdated
            };

            // Análise de ganhos por tipo
            const earningsBreakdown = history
                .filter(t => t.type === 'earn')
                .reduce((acc: Record<string, { count: number; total: number }>, transaction) => {
                    const reason = transaction.reason;
                    if (!acc[reason]) {
                        acc[reason] = { count: 0, total: 0 };
                    }
                    acc[reason].count++;
                    acc[reason].total += transaction.amount;
                    return acc;
                }, {});

            res.status(200).json({
                statement: {
                    summary,
                    transactionsByDate,
                    earningsBreakdown,
                    recentTransactions: history.slice(0, 10), // Últimas 10 transações
                    pagination: {
                        limit,
                        offset,
                        total: history.length,
                        hasMore: history.length === limit
                    }
                }
            });
        } catch (error) {
            console.error('Error getting coin statement:', error);
            res.status(500).json({ message: 'Erro ao buscar extrato de moedas', error });
        }
    }

    // POST /api/coins/reward - Recompensar usuário por conquista específica
    public static async rewardUser(req: Request, res: Response): Promise<void> {
        try {
            const { userId, rewardType, gameData } = req.body;
            
            if (!userId || !rewardType) {
                res.status(400).json({ message: 'userId e rewardType são obrigatórios' });
                return;
            }

            let amount = 0;
            let reason = '';
            let description = '';

            switch (rewardType) {
                case 'EASY_WIN':
                    amount = COIN_REWARDS.EASY_WIN;
                    reason = 'easy_win';
                    description = 'Vitória no modo fácil';
                    break;
                case 'MEDIUM_WIN':
                    amount = COIN_REWARDS.MEDIUM_WIN;
                    reason = 'medium_win';
                    description = 'Vitória no modo médio';
                    break;
                case 'HARD_WIN':
                    amount = COIN_REWARDS.HARD_WIN;
                    reason = 'hard_win';
                    description = 'Vitória no modo difícil';
                    break;
                case 'DAILY_CURRENT':
                    amount = COIN_REWARDS.DAILY_CURRENT_DAY;
                    reason = 'daily_current';
                    description = 'Vitória no modo diário (mesmo dia)';
                    break;
                case 'DAILY_RETROACTIVE':
                    amount = COIN_REWARDS.DAILY_RETROACTIVE;
                    reason = 'daily_retroactive';
                    description = 'Vitória no modo diário (retroativo)';
                    break;
                case 'DAILY_BONUS':
                    amount = COIN_REWARDS.DAILY_BONUS;
                    reason = 'daily_bonus';
                    description = 'Bônus diário por jogar';
                    break;
                case 'SPEED_BONUS':
                    amount = COIN_REWARDS.SPEED_BONUS;
                    reason = 'speed_bonus';
                    description = 'Bônus por velocidade';
                    break;
                case 'STREAK_BONUS':
                    amount = COIN_REWARDS.STREAK_BONUS;
                    reason = 'streak_bonus';
                    description = 'Bônus por sequência de vitórias';
                    break;
                default:
                    res.status(400).json({ message: 'Tipo de recompensa inválido' });
                    return;
            }

            const userCoins = await coinsRepository.addCoins(userId, amount, reason, description, gameData);
            res.status(200).json({ 
                message: 'Usuário recompensado com sucesso',
                reward: {
                    type: rewardType,
                    amount,
                    description
                },
                userCoins
            });
        } catch (error) {
            console.error('Error rewarding user:', error);
            res.status(500).json({ message: 'Erro ao recompensar usuário', error });
        }
    }

    // GET /api/coins/prices - Obter tabela de preços
    public static async getPrices(req: Request, res: Response): Promise<void> {
        try {
            res.status(200).json({
                rewards: COIN_REWARDS,
                costs: COIN_COSTS,
                description: {
                    rewards: 'Moedas ganhas por diferentes conquistas',
                    costs: 'Custo em moedas para diferentes recursos'
                }
            });
        } catch (error) {
            console.error('Error getting prices:', error);
            res.status(500).json({ message: 'Erro ao buscar tabela de preços', error });
        }
    }

    // PUT /api/coins/:userId/reset - Resetar moedas do usuário (admin)
    public static async resetUserCoins(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            
            if (!userId) {
                res.status(400).json({ message: 'userId é obrigatório' });
                return;
            }

            const userCoins = await coinsRepository.resetUserCoins(userId);
            res.status(200).json({ 
                message: 'Moedas do usuário resetadas com sucesso',
                userCoins
            });
        } catch (error) {
            console.error('Error resetting user coins:', error);
            res.status(500).json({ message: 'Erro ao resetar moedas do usuário', error });
        }
    }
}