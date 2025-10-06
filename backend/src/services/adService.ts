import { AD_CONFIG, AdType, getAdReward, getAdCooldown, calculateDailyBonus } from '../config/adConfig';

export interface AdWatchRequest {
    userId: string;
    adType: AdType;
    viewDuration?: number; // em segundos
    adId?: string; // ID único do anúncio para rastreamento
    clientTimestamp: number;
}

export interface AdReward {
    baseReward: number;
    bonusReward: number;
    totalReward: number;
    bonusReason?: string;
    nextAdAvailable: number; // timestamp
}

export interface AdWatchResponse {
    success: boolean;
    reward?: AdReward;
    newBalance: number;
    message: string;
    cooldownRemaining?: number;
    error?: string;
}

export interface AdAvailability {
    adType: AdType;
    available: boolean;
    reward: number;
    cooldownRemaining: number; // em segundos
    dailyRemaining: number;
    nextAvailable: Date | null;
}

class AdService {
    // Cache em memória para rate limiting (em produção usar Redis)
    private adHistory: Map<string, Array<{timestamp: number, type: AdType}>> = new Map();
    private dailyStats: Map<string, {date: string, count: number, earnings: number}> = new Map();

    /**
     * Verificar se o usuário pode assistir um anúncio específico
     */
    canWatchAd(userId: string, adType: AdType): { canWatch: boolean; reason?: string; cooldownRemaining?: number } {
        const now = Date.now();
        const userHistory = this.adHistory.get(userId) || [];
        
        // Limpar histórico antigo (mais de 24 horas)
        const cleanHistory = userHistory.filter(ad => now - ad.timestamp < 24 * 60 * 60 * 1000);
        this.adHistory.set(userId, cleanHistory);

        // Verificar cooldown específico do tipo de anúncio
        const typeHistory = cleanHistory.filter(ad => ad.type === adType);
        if (typeHistory.length > 0) {
            const lastAd = typeHistory[typeHistory.length - 1];
            const cooldown = getAdCooldown(adType) * 1000; // converter para ms
            const timeSinceLastAd = now - lastAd.timestamp;
            
            if (timeSinceLastAd < cooldown) {
                return {
                    canWatch: false,
                    reason: `Aguarde ${Math.ceil((cooldown - timeSinceLastAd) / 1000)}s para assistir outro ${adType}`,
                    cooldownRemaining: Math.ceil((cooldown - timeSinceLastAd) / 1000)
                };
            }
        }

        // Verificar cooldown geral entre anúncios
        if (cleanHistory.length > 0) {
            const lastAnyAd = cleanHistory[cleanHistory.length - 1];
            const generalCooldown = AD_CONFIG.RATE_LIMITS.cooldownBetweenAds * 1000;
            const timeSinceLastAnyAd = now - lastAnyAd.timestamp;
            
            if (timeSinceLastAnyAd < generalCooldown) {
                return {
                    canWatch: false,
                    reason: `Aguarde ${Math.ceil((generalCooldown - timeSinceLastAnyAd) / 1000)}s entre anúncios`,
                    cooldownRemaining: Math.ceil((generalCooldown - timeSinceLastAnyAd) / 1000)
                };
            }
        }

        // Verificar limite diário do tipo
        const adConfig = AD_CONFIG.AD_TYPES[adType];
        const todayAds = typeHistory.filter(ad => {
            const adDate = new Date(ad.timestamp).toDateString();
            const today = new Date().toDateString();
            return adDate === today;
        });

        if (todayAds.length >= adConfig.maxPerDay) {
            return {
                canWatch: false,
                reason: `Limite diário de ${adConfig.maxPerDay} ${adType} atingido`
            };
        }

        // Verificar limite geral por hora
        const oneHourAgo = now - (60 * 60 * 1000);
        const recentAds = cleanHistory.filter(ad => ad.timestamp > oneHourAgo);
        if (recentAds.length >= AD_CONFIG.RATE_LIMITS.maxAdsPerHour) {
            return {
                canWatch: false,
                reason: `Limite de ${AD_CONFIG.RATE_LIMITS.maxAdsPerHour} anúncios por hora atingido`
            };
        }

        return { canWatch: true };
    }

    /**
     * Processar visualização de anúncio e calcular recompensa
     */
    async processAdWatch(request: AdWatchRequest): Promise<AdReward> {
        const { userId, adType, viewDuration = 0 } = request;
        
        // Validar duração mínima para vídeos
        if (adType === 'rewarded_video' && viewDuration < AD_CONFIG.FRAUD_DETECTION.minViewDuration) {
            throw new Error(`Vídeo deve ser assistido por pelo menos ${AD_CONFIG.FRAUD_DETECTION.minViewDuration}s`);
        }

        // Calcular recompensa base
        const baseReward = getAdReward(adType);
        let bonusReward = 0;
        let bonusReason = '';

        // Verificar se é o primeiro anúncio do dia
        const today = new Date().toDateString();
        const userHistory = this.adHistory.get(userId) || [];
        const todayAds = userHistory.filter(ad => {
            const adDate = new Date(ad.timestamp).toDateString();
            return adDate === today;
        });

        if (todayAds.length === 0) {
            bonusReward += AD_CONFIG.BONUSES.firstAdOfDay;
            bonusReason = 'Primeiro anúncio do dia';
        }

        // TODO: Implementar streak bonus (requer histórico persistente)
        // const streakDays = await this.getConsecutiveDays(userId);
        // const streakBonus = calculateDailyBonus(streakDays);
        // bonusReward += streakBonus;

        const totalReward = baseReward + bonusReward;

        // Registrar no histórico
        const now = Date.now();
        userHistory.push({ timestamp: now, type: adType });
        this.adHistory.set(userId, userHistory);

        // Atualizar estatísticas diárias
        const dailyKey = `${userId}:${today}`;
        const dailyStat = this.dailyStats.get(dailyKey) || { date: today, count: 0, earnings: 0 };
        dailyStat.count++;
        dailyStat.earnings += totalReward;
        this.dailyStats.set(dailyKey, dailyStat);

        return {
            baseReward,
            bonusReward,
            totalReward,
            bonusReason: bonusReason || undefined,
            nextAdAvailable: now + (getAdCooldown(adType) * 1000)
        };
    }

    /**
     * Obter status de disponibilidade de todos os tipos de anúncio
     */
    getAdAvailability(userId: string): AdAvailability[] {
        const availability: AdAvailability[] = [];
        
        for (const [adType, config] of Object.entries(AD_CONFIG.AD_TYPES)) {
            const canWatch = this.canWatchAd(userId, adType as AdType);
            const userHistory = this.adHistory.get(userId) || [];
            
            // Contar anúncios do tipo hoje
            const today = new Date().toDateString();
            const todayAdsOfType = userHistory.filter(ad => {
                const adDate = new Date(ad.timestamp).toDateString();
                return adDate === today && ad.type === adType;
            }).length;

            availability.push({
                adType: adType as AdType,
                available: canWatch.canWatch,
                reward: config.reward,
                cooldownRemaining: canWatch.cooldownRemaining || 0,
                dailyRemaining: config.maxPerDay - todayAdsOfType,
                nextAvailable: canWatch.canWatch ? new Date() : null
            });
        }

        return availability;
    }

    /**
     * Obter estatísticas de anúncios do usuário
     */
    getUserAdStats(userId: string) {
        const userHistory = this.adHistory.get(userId) || [];
        const now = Date.now();
        
        // Estatísticas por período
        const last24h = userHistory.filter(ad => now - ad.timestamp < 24 * 60 * 60 * 1000);
        const last7d = userHistory.filter(ad => now - ad.timestamp < 7 * 24 * 60 * 60 * 1000);
        
        // Estatísticas por tipo
        const byType = Object.keys(AD_CONFIG.AD_TYPES).reduce((acc, type) => {
            acc[type] = userHistory.filter(ad => ad.type === type).length;
            return acc;
        }, {} as Record<string, number>);

        return {
            totalAds: userHistory.length,
            last24Hours: last24h.length,
            last7Days: last7d.length,
            byType,
            estimatedEarnings: this.calculateEstimatedEarnings(userHistory)
        };
    }

    private calculateEstimatedEarnings(history: Array<{timestamp: number, type: AdType}>): number {
        return history.reduce((total, ad) => {
            return total + getAdReward(ad.type);
        }, 0);
    }
}

export default new AdService();