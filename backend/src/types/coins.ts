export interface CoinTransaction {
    _id?: string;
    userId: string;
    type: 'earn' | 'spend';
    amount: number;
    reason: string;
    description?: string;
    createdAt: Date;
    metadata?: {
        gameId?: string;
        itemId?: string;
        achievementId?: string;
        [key: string]: any;
    };
}

export interface UserCoins {
    _id?: string;
    userId: string;
    balance: number;
    totalEarned: number;
    totalSpent: number;
    lastUpdated: Date;
}

export interface CoinEarnReason {
    GAME_WIN: 'game_win';
    DAILY_BONUS: 'daily_bonus';
    PERFECT_GAME: 'perfect_game';
    SPEED_BONUS: 'speed_bonus';
    STREAK_BONUS: 'streak_bonus';
    ACHIEVEMENT: 'achievement';
    ADMIN_GIFT: 'admin_gift';
}

export interface CoinSpendReason {
    HINT_PURCHASE: 'hint_purchase';
    EXTRA_ATTEMPTS: 'extra_attempts';
    PREMIUM_FEATURE: 'premium_feature';
    STORE_ITEM: 'store_item';
}

export const COIN_REWARDS = {
    // Recompensas base por dificuldade (modo normal)
    EASY_WIN: 1,
    MEDIUM_WIN: 3,
    HARD_WIN: 10,
    
    // Multiplicadores por modo
    BLUR_MULTIPLIER: 1.5,
    TEXT_MULTIPLIER: 1.2,
    
    // Modo diário
    DAILY_CURRENT_DAY: 30, // Jogar no mesmo dia
    DAILY_RETROACTIVE: 1,  // Jogar retroativamente
    
    // Bônus especiais
    PERFECT_GAME_BONUS: 0.5, // 50% extra por acertar na primeira
    DAILY_BONUS: 25,
    SPEED_BONUS: 20,
    STREAK_BONUS: 15,
} as const;

export const COIN_COSTS = {
    HINT_REVEAL_TYPE: 5,
    HINT_REVEAL_CMC: 3,
    HINT_REVEAL_COLOR: 8,
    EXTRA_ATTEMPTS: 15,
} as const;