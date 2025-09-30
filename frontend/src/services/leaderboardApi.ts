const API_BASE_URL = 'http://localhost:3001/api';

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

export interface SpeedLeaderboardEntry {
    userId: string;
    name: string;
    email: string;
    bestTime: number;
    bestAttempts: number;
    bestDate: string;
    totalGames: number;
}

export interface PerfectLeaderboardEntry {
    userId: string;
    name: string;
    email: string;
    bestAttempts: number;
    bestTime: number;
    bestDate: string;
    totalGames: number;
}

export interface BlurLeaderboardEntry {
    _id: string;
    name: string;
    email: string;
    totalAttempts: number;
    totalBlurAttempts: number;
    games: number;
    avgTimeSpent: number;
    avgAttemptsPerGame: number;
    avgBlurAttemptsPerGame: number;
}

export interface BlurSpeedLeaderboardEntry {
    _id: string;
    name: string;
    email: string;
    fastestTime: number;
    avgTime: number;
    games: number;
}

export interface BlurPerfectLeaderboardEntry {
    _id: string;
    name: string;
    email: string;
    perfectGames: number;
    avgTimeSpent: number;
    fastestPerfect: number;
}

/**
 * Obtém leaderboard de jogos normais (geral)
 */
export const getNormalLeaderboard = async (limit: number = 50): Promise<LeaderboardEntry[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/leaderboards/normal?limit=${limit}`);
        if (!response.ok) {
            throw new Error('Failed to fetch normal leaderboard');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching normal leaderboard:', error);
        return [];
    }
};

/**
 * Obtém leaderboard de jogos diários
 */
export const getDailyLeaderboard = async (limit: number = 50): Promise<DailyLeaderboardEntry[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/leaderboards/daily?limit=${limit}`);
        if (!response.ok) {
            throw new Error('Failed to fetch daily leaderboard');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching daily leaderboard:', error);
        return [];
    }
};

/**
 * Obtém leaderboard de melhores tempos (speed run)
 */
export const getSpeedLeaderboard = async (
    gameType: 'normal' | 'daily', 
    limit: number = 50
): Promise<SpeedLeaderboardEntry[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/leaderboards/speed/${gameType}?limit=${limit}`);
        if (!response.ok) {
            throw new Error('Failed to fetch speed leaderboard');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching speed leaderboard:', error);
        return [];
    }
};

/**
 * Obtém leaderboard de menores tentativas (perfect run)
 */
export const getPerfectLeaderboard = async (
    gameType: 'normal' | 'daily', 
    limit: number = 50
): Promise<PerfectLeaderboardEntry[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/leaderboards/perfect/${gameType}?limit=${limit}`);
        if (!response.ok) {
            throw new Error('Failed to fetch perfect leaderboard');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching perfect leaderboard:', error);
        return [];
    }
};

/**
 * Obtém leaderboard geral do modo blur
 */
export const getBlurLeaderboard = async (limit: number = 50): Promise<BlurLeaderboardEntry[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/leaderboards/blur?limit=${limit}`);
        if (!response.ok) {
            throw new Error('Failed to fetch blur leaderboard');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching blur leaderboard:', error);
        return [];
    }
};

/**
 * Obtém leaderboard de velocidade do modo blur
 */
export const getBlurSpeedLeaderboard = async (limit: number = 50): Promise<BlurSpeedLeaderboardEntry[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/leaderboards/blur-speed?limit=${limit}`);
        if (!response.ok) {
            throw new Error('Failed to fetch blur speed leaderboard');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching blur speed leaderboard:', error);
        return [];
    }
};

/**
 * Obtém leaderboard de jogos perfeitos do modo blur
 */
export const getBlurPerfectLeaderboard = async (limit: number = 50): Promise<BlurPerfectLeaderboardEntry[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/leaderboards/blur-perfect?limit=${limit}`);
        if (!response.ok) {
            throw new Error('Failed to fetch blur perfect leaderboard');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching blur perfect leaderboard:', error);
        return [];
    }
};