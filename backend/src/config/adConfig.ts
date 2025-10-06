// Configurações do sistema de anúncios
export const AD_CONFIG = {
    // Tipos de anúncios e suas recompensas
    AD_TYPES: {
        rewarded_video: {
            reward: 5, // 5 moedas por vídeo
            cooldown: 300, // 5 minutos entre anúncios do mesmo tipo
            maxPerDay: 20, // máximo 20 vídeos por dia
            description: 'Vídeo recompensado'
        },
        interstitial: {
            reward: 2, // 2 moedas por interstitial
            cooldown: 180, // 3 minutos entre anúncios
            maxPerDay: 30, // máximo 30 por dia
            description: 'Anúncio em tela cheia'
        },
        banner_click: {
            reward: 1, // 1 moeda por clique em banner
            cooldown: 60, // 1 minuto entre cliques
            maxPerDay: 50, // máximo 50 por dia
            description: 'Clique em banner'
        }
    },

    // Configurações de rate limiting
    RATE_LIMITS: {
        maxAdsPerHour: 15,
        maxAdsPerDay: 100,
        cooldownBetweenAds: 30 // 30 segundos mínimo entre qualquer anúncio
    },

    // Configurações de detecção de fraude
    FRAUD_DETECTION: {
        maxSameTypePerMinute: 2,
        maxClicksPerSecond: 1,
        minViewDuration: 15, // segundos mínimos para vídeos
        maxDailyEarnings: 500 // máximo de moedas por dia via anúncios
    },

    // Bônus especiais
    BONUSES: {
        firstAdOfDay: 3, // 3 moedas extras no primeiro anúncio do dia
        dailyStreakBonus: {
            3: 2, // +2 moedas após 3 dias consecutivos
            7: 5, // +5 moedas após 7 dias consecutivos
            30: 10 // +10 moedas após 30 dias consecutivos
        }
    },

    // Configurações de exibição
    UI_CONFIG: {
        showAdButton: true,
        adButtonCooldownDisplay: true,
        rewardPreview: true,
        animateRewards: true
    }
} as const;

export type AdType = keyof typeof AD_CONFIG.AD_TYPES;

// Função helper para validar tipo de anúncio
export function isValidAdType(type: string): type is AdType {
    return Object.keys(AD_CONFIG.AD_TYPES).includes(type);
}

// Função helper para obter recompensa de um anúncio
export function getAdReward(adType: AdType): number {
    return AD_CONFIG.AD_TYPES[adType].reward;
}

// Função helper para obter cooldown de um anúncio
export function getAdCooldown(adType: AdType): number {
    return AD_CONFIG.AD_TYPES[adType].cooldown;
}

// Função helper para calcular bônus diário
export function calculateDailyBonus(consecutiveDays: number): number {
    const bonuses = AD_CONFIG.BONUSES.dailyStreakBonus;
    if (consecutiveDays >= 30) return bonuses[30];
    if (consecutiveDays >= 7) return bonuses[7];
    if (consecutiveDays >= 3) return bonuses[3];
    return 0;
}