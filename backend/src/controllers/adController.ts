import { Request, Response } from 'express';
import adService, { AdWatchRequest, AdWatchResponse } from '../services/adService';
import coinsRepository from '../repositories/coinsRepository';
import { AD_CONFIG, isValidAdType } from '../config/adConfig';

export class AdController {
    /**
     * GET /api/ads/availability/:userId
     * Obter disponibilidade de anúncios para o usuário
     */
    public static async getAdAvailability(req: Request, res: Response): Promise<void> {
        const startTime = Date.now();
        
        try {
            const { userId } = req.params;
            
            if (!userId) {
                res.status(400).json({ message: 'userId é obrigatório' });
                return;
            }

            const availability = adService.getAdAvailability(userId);
            
            const duration = Date.now() - startTime;
            console.log(`📺 Ad availability check completed in ${duration}ms - User: ${userId}`);
            
            res.status(200).json({
                success: true,
                userId,
                availability,
                config: {
                    maxAdsPerHour: AD_CONFIG.RATE_LIMITS.maxAdsPerHour,
                    maxAdsPerDay: AD_CONFIG.RATE_LIMITS.maxAdsPerDay,
                    cooldownBetweenAds: AD_CONFIG.RATE_LIMITS.cooldownBetweenAds
                }
            });
            
        } catch (error) {
            const duration = Date.now() - startTime;
            console.error(`❌ Ad availability check failed after ${duration}ms:`, error);
            
            res.status(500).json({ 
                message: 'Erro ao verificar disponibilidade de anúncios', 
                error: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
            });
        }
    }

    /**
     * POST /api/ads/watch
     * Registrar visualização de anúncio e recompensar usuário
     */
    public static async watchAd(req: Request, res: Response): Promise<void> {
        const startTime = Date.now();
        console.log(`📺 Ad watch started - User: ${req.body.userId}, Type: ${req.body.adType}`);
        
        try {
            const { userId, adType, viewDuration, adId }: AdWatchRequest = req.body;

            // Validações básicas
            if (!userId || !adType) {
                res.status(400).json({ message: 'userId e adType são obrigatórios' });
                return;
            }

            if (!isValidAdType(adType)) {
                res.status(400).json({ 
                    message: 'Tipo de anúncio inválido',
                    validTypes: Object.keys(AD_CONFIG.AD_TYPES)
                });
                return;
            }

            // Verificar se usuário pode assistir este anúncio
            const canWatch = adService.canWatchAd(userId, adType);
            if (!canWatch.canWatch) {
                res.status(429).json({
                    success: false,
                    message: canWatch.reason,
                    cooldownRemaining: canWatch.cooldownRemaining
                });
                return;
            }

            // Processar visualização do anúncio
            const adReward = await adService.processAdWatch({
                userId,
                adType,
                viewDuration,
                adId,
                clientTimestamp: Date.now()
            });

            // Recompensar usuário with moedas
            await coinsRepository.addCoins(
                userId,
                adReward.totalReward,
                `ad_${adType}`,
                `Anúncio: ${AD_CONFIG.AD_TYPES[adType].description}`,
                {
                    adType,
                    adId,
                    viewDuration,
                    baseReward: adReward.baseReward,
                    bonusReward: adReward.bonusReward,
                    bonusReason: adReward.bonusReason
                }
            );

            // Obter novo saldo
            const updatedCoins = await coinsRepository.getUserCoins(userId);

            const response: AdWatchResponse = {
                success: true,
                reward: adReward,
                newBalance: updatedCoins?.balance || 0,
                message: `Você ganhou ${adReward.totalReward} moedas assistindo o anúncio!`
            };

            const duration = Date.now() - startTime;
            console.log(`✅ Ad watch completed successfully in ${duration}ms - User: ${userId}, Type: ${adType}, Reward: ${adReward.totalReward}, New Balance: ${response.newBalance}`);

            res.status(200).json(response);

        } catch (error) {
            const duration = Date.now() - startTime;
            console.error(`❌ Ad watch failed after ${duration}ms:`, error);
            console.error(`Failed ad watch details - User: ${req.body.userId}, Type: ${req.body.adType}`);
            
            res.status(500).json({ 
                success: false,
                message: error instanceof Error ? error.message : 'Erro ao processar anúncio',
                error: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
            });
        }
    }

    /**
     * GET /api/ads/stats/:userId
     * Obter estatísticas de anúncios do usuário
     */
    public static async getAdStats(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            
            if (!userId) {
                res.status(400).json({ message: 'userId é obrigatório' });
                return;
            }

            const stats = adService.getUserAdStats(userId);
            
            res.status(200).json({
                success: true,
                userId,
                stats
            });
            
        } catch (error) {
            console.error('❌ Error getting ad stats:', error);
            
            res.status(500).json({ 
                message: 'Erro ao obter estatísticas de anúncios', 
                error: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
            });
        }
    }

    /**
     * GET /api/ads/config
     * Obter configurações públicas do sistema de anúncios
     */
    public static async getAdConfig(req: Request, res: Response): Promise<void> {
        try {
            // Retornar apenas configurações que o cliente precisa saber
            const publicConfig = {
                adTypes: Object.entries(AD_CONFIG.AD_TYPES).reduce((acc, [type, config]) => {
                    acc[type] = {
                        reward: config.reward,
                        description: config.description,
                        maxPerDay: config.maxPerDay
                    };
                    return acc;
                }, {} as any),
                rateLimits: AD_CONFIG.RATE_LIMITS,
                bonuses: AD_CONFIG.BONUSES
            };

            res.status(200).json({
                success: true,
                config: publicConfig
            });
            
        } catch (error) {
            console.error('❌ Error getting ad config:', error);
            
            res.status(500).json({ 
                message: 'Erro ao obter configuração de anúncios', 
                error: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
            });
        }
    }
}