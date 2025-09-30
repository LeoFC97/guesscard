const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export interface UserCoins {
    _id?: string;
    userId: string;
    balance: number;
    totalEarned: number;
    totalSpent: number;
    lastUpdated: Date;
}

export interface CoinTransaction {
    _id?: string;
    userId: string;
    type: 'earn' | 'spend';
    amount: number;
    reason: string;
    description?: string;
    createdAt: Date;
    metadata?: any;
}

export interface CoinStats {
    balance: number;
    totalEarned: number;
    totalSpent: number;
    earnedToday: number;
    spentToday: number;
    lastUpdated: Date;
}

class CoinsApi {
    // Obter saldo do usuário
    async getUserCoins(userId: string): Promise<UserCoins> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/coins/${userId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error getting user coins:', error);
            throw error;
        }
    }

    // Obter estatísticas detalhadas
    async getUserCoinStats(userId: string): Promise<CoinStats> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/coins/${userId}/stats`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error getting user coin stats:', error);
            throw error;
        }
    }

    // Adicionar moedas
    async addCoins(userId: string, amount: number, reason: string, description?: string, metadata?: any): Promise<any> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/coins/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    amount,
                    reason,
                    description,
                    metadata
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error adding coins:', error);
            throw error;
        }
    }

    // Gastar moedas
    async spendCoins(userId: string, amount: number, reason: string, description?: string, metadata?: any): Promise<any> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/coins/spend`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    amount,
                    reason,
                    description,
                    metadata
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error spending coins:', error);
            throw error;
        }
    }

    // Obter histórico de transações
    async getCoinHistory(userId: string, limit: number = 50, offset: number = 0): Promise<{ history: CoinTransaction[], pagination: any }> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/coins/${userId}/history?limit=${limit}&offset=${offset}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error getting coin history:', error);
            throw error;
        }
    }

    // Obter extrato completo de moedas
    async getCoinStatement(userId: string, limit: number = 100, offset: number = 0): Promise<any> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/coins/${userId}/statement?limit=${limit}&offset=${offset}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error getting coin statement:', error);
            throw error;
        }
    }

    // Recompensar usuário por conquista
    async rewardUser(userId: string, rewardType: string, gameData?: any): Promise<any> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/coins/reward`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    rewardType,
                    gameData
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error rewarding user:', error);
            throw error;
        }
    }

    // Obter tabela de preços
    async getPrices(): Promise<any> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/coins/prices`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error getting prices:', error);
            throw error;
        }
    }
}

const coinsApi = new CoinsApi();
export default coinsApi;