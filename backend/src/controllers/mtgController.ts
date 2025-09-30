import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { ScryfallService } from '../services/scryfallService';
import matchRepo from '../repositories/matchRepository';
import dailyMatchRepo from '../repositories/dailyMatchRepository';
import dailyCardRepo from '../repositories/dailyCardRepository';
import { getUserStatsService } from '../services/userStatsService';
import leaderboardService from '../services/leaderboardService';
import { maskCardNameInText } from '../utils/textUtils';

// Mapeamento em memória para partidas: { [gameId]: targetCard }
const games: Record<string, any> = {};

export interface Feedback {
    feedback: {
        colors: string;
        type: string;
        cmc: string;
        edition: string;
        rarity: string;
        artist: string;
        [key: string]: string;
    };
    isCorrect: boolean;
    guessedCard: {
        name: string;
        colors: string[];
        type: string;
        cmc: number;
        setName: string;
        rarity: string;
        artist: string;
        text?: string;
        legalities?: Record<string, string>;
        [key: string]: any;
    };
}

export interface CardInfo {
    colors: string[];
    type: string;
    cmc: number;
    setName: string;
    rarity: string;
    artist: string;
    legalities?: Record<string, string>;
}

export class MtgController {
    private scryfallService: ScryfallService;

    constructor() {
        this.scryfallService = new ScryfallService();
    }

    // Endpoint: GET /api/user-stats/:userId
    public static async getUserStats(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const stats = await getUserStatsService(userId);
            res.status(200).json(stats);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching user stats', error });
        }
    }

    public static async getUserBlurStats(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const blurMatchRepo = require('../repositories/blurMatchRepository').default;
            const blurStats = await blurMatchRepo.getUserBlurStats(userId);
            res.status(200).json(blurStats);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching user blur stats', error });
        }
    }
    public static async getDailyPlayedDates(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            if (!userId) {
                res.status(400).json({ message: 'userId obrigatório' });
                return;
            }
            const dates = await dailyMatchRepo.getPlayedDates(userId);
            res.status(200).json({ dates });
        } catch (error) {
            res.status(500).json({ message: 'Erro ao buscar dias já jogados', error });
        }
    }

    // Endpoint para modo diário
    public static async dailyGame(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.query.userId;
            const date = req.query.date;
            const dateStr = typeof date === 'string' && date.length === 10 ? date : new Date().toISOString().slice(0, 10);
            if (!userId) {
                res.status(400).json({ message: 'userId é obrigatório para jogar a daily.' });
                return;
            }
            if (!dateStr) {
                res.status(400).json({ message: 'date é obrigatório para jogar a daily.' });
                return;
            }

            // Validação: não permitir datas futuras
            const requestedDate = new Date(dateStr + 'T00:00:00.000Z');
            const today = new Date();
            today.setUTCHours(0, 0, 0, 0); // Zerar horário para comparar apenas a data

            if (requestedDate > today) {
                res.status(400).json({ 
                    message: 'Não é possível jogar cartas do futuro. Escolha uma data de hoje ou anterior.',
                    requestedDate: dateStr,
                    todayDate: today.toISOString().slice(0, 10)
                });
                return;
            }
            const alreadyPlayed = await dailyMatchRepo.findByUserAndDate(userId as string, dateStr);
            if (alreadyPlayed) {
                res.status(403).json({ message: 'Você já jogou a daily desse dia.' });
                return;
            }
            const dailyCardDoc = await dailyCardRepo.getDailyCard(dateStr);
            if (!dailyCardDoc) {
                res.status(404).json({ message: 'Nenhuma carta definida para este dia.' });
                return;
            }
            const cards = await (new ScryfallService()).fetchCardByParam('name', dailyCardDoc.cardName);
            const card = cards.length > 0 ? (new ScryfallService()).convertToLegacyFormat(cards[0]) : null;
            if (!card) {
                res.status(500).json({ message: 'Could not fetch card for this day' });
                return;
            }
            res.status(200).json({ message: 'Daily game', cardName: card.name, date: dateStr, gameId: `daily-${dateStr}` });
        } catch (error) {
            res.status(500).json({ message: 'Error starting daily game', error });
        }
    }

    public async getCard(req: Request, res: Response): Promise<void> {
        try {
            const cardName = req.params.name.trim();
            const cards = await this.scryfallService.fetchCardByParam("name", cardName);
            const card = cards.map(c => this.scryfallService.convertToLegacyFormat(c));
            res.status(200).json(card);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching card', error });
        }
    }

    public async guessCard(req: Request, res: Response): Promise<void> {
        try {
            const { gameId, guess, userId, name, email, attempts, timeSpent } = req.body;
            if (!gameId || typeof gameId !== 'string') {
                res.status(400).json({ message: 'Missing or invalid gameId.' });
                return;
            }
            const { processGuessCard } = require('../services/mtgGameService');
            const result = await processGuessCard({
                gameId,
                guess,
                userId,
                name,
                email,
                attempts,
                timeSpent,
                games
            });
            res.status(200).json(result);
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'No game in progress for this gameId. Please start a new game.') {
                    res.status(400).json({ message: error.message });
                } else if (error.message === 'Guess must be a string (card name)') {
                    res.status(400).json({ message: error.message });
                } else if (error.message === 'Guessed card not found') {
                    res.status(404).json({ message: error.message });
                } else if (error.message === 'Could not fetch Black Lotus') {
                    res.status(500).json({ message: error.message });
                } else {
                    console.log(error);
                    res.status(500).json({ message: 'Error processing guess', error });
                }
            } else {
                console.log(error);
                res.status(500).json({ message: 'Error processing guess', error });
            }
        }
    }

    // Novo endpoint para sortear uma nova carta
    public static async newGame(req: Request, res: Response): Promise<void> {
        try {
            const { difficulty } = req.body;
            let cardList: string[];
            const { easyCards, mediumCards, hardCards } = require('../cardDifficulties');
            if (difficulty === 'easy') {
                cardList = easyCards;
            } else if (difficulty === 'hard') {
                cardList = hardCards;
            } else {
                cardList = mediumCards;
            }
            const randomIndex = Math.floor(Math.random() * cardList.length);
            const cardName = cardList[randomIndex];
            const cards = await (new ScryfallService()).fetchCardByParam('name', cardName);
            const targetCard = cards.length > 0 ? (new ScryfallService()).convertToLegacyFormat(cards[0]) : null;
            if (!targetCard) {
                res.status(500).json({ message: 'Could not pick a new card' });
                return;
            }
            const gameId = randomUUID();
            games[gameId] = targetCard;
            res.status(200).json({ message: 'New game started', cardName: targetCard.name, gameId });
        } catch (error) {
            res.status(500).json({ message: 'Error starting new game', error });
        }
    }

    // Novo endpoint para modo texto - carta com nome censurado
    public static async newTextGame(req: Request, res: Response): Promise<void> {
        try {
            const { difficulty } = req.body;
            let cardList: string[];
            const { easyCards, mediumCards, hardCards } = require('../cardDifficulties');
            if (difficulty === 'easy') {
                cardList = easyCards;
            } else if (difficulty === 'hard') {
                cardList = hardCards;
            } else {
                cardList = mediumCards;
            }
            const randomIndex = Math.floor(Math.random() * cardList.length);
            const cardName = cardList[randomIndex];
            const cards = await (new ScryfallService()).fetchCardByParam('name', cardName);
            const targetCard = cards.length > 0 ? (new ScryfallService()).convertToLegacyFormat(cards[0]) : null;
            if (!targetCard) {
                res.status(500).json({ message: 'Could not pick a new card' });
                return;
            }
            const gameId = `text-${randomUUID()}`;
            // Armazenar carta com informação de que é modo texto
            games[gameId] = { 
                ...targetCard, 
                gameMode: 'text',
                startTime: Date.now() // Timestamp do início do jogo
            };
            // Censurar o texto que será enviado
            const originalText = targetCard.text || '';
            const censoredText = maskCardNameInText(originalText, targetCard.name);
            
            res.status(200).json({ 
                message: 'New text game started', 
                cardName: targetCard.name, 
                gameId,
                gameMode: 'text',
                cardImage: targetCard.imageUrl || targetCard.image_uris?.normal,
                cardText: censoredText,
                originalText: originalText, // Para debug (remover em produção)
                cardType: targetCard.type || '',
                manaCost: targetCard.cmc || 0,
                hasCensoredContent: originalText !== censoredText
            });
        } catch (error) {
            res.status(500).json({ message: 'Error starting new text game', error });
        }
    }

    // Novo endpoint para modo blur - carta começa borrada
    public static async newBlurGame(req: Request, res: Response): Promise<void> {
        try {
            const { difficulty } = req.body;
            let cardList: string[];
            const { easyCards, mediumCards, hardCards } = require('../cardDifficulties');
            if (difficulty === 'easy') {
                cardList = easyCards;
            } else if (difficulty === 'hard') {
                cardList = hardCards;
            } else {
                cardList = mediumCards;
            }
            const randomIndex = Math.floor(Math.random() * cardList.length);
            const cardName = cardList[randomIndex];
            const cards = await (new ScryfallService()).fetchCardByParam('name', cardName);
            const targetCard = cards.length > 0 ? (new ScryfallService()).convertToLegacyFormat(cards[0]) : null;
            if (!targetCard) {
                res.status(500).json({ message: 'Could not pick a new card' });
                return;
            }
            const gameId = `blur-${randomUUID()}`;
            // Armazenar carta com informação de que é modo blur
            games[gameId] = { 
                ...targetCard, 
                gameMode: 'blur',
                maxBlurAttempts: -1, // Sem limite de tentativas
                currentBlurAttempts: 0, // Rastrear tentativas atuais do modo blur
                initialBlur: 20, // Começa com blur mais fraco (20px)
                blurReduction: 0.15, // Reduz 15% a cada palpite
                startTime: Date.now() // Timestamp do início do jogo
            };
            res.status(200).json({ 
                message: 'New blur game started', 
                cardName: targetCard.name, 
                gameId,
                gameMode: 'blur',
                cardImage: targetCard.imageUrl || targetCard.image_uris?.normal,
                maxBlurAttempts: -1, // Sem limite
                initialBlur: 20, // Blur inicial mais fraco
                blurReduction: 0.15 // Redução de 15% por palpite
            });
        } catch (error) {
            res.status(500).json({ message: 'Error starting new blur game', error });
        }
    }

    // Endpoint para buscar informações do jogo blur em andamento
    public static async getBlurGameStatus(req: Request, res: Response): Promise<void> {
        try {
            const { gameId } = req.params;
            
            if (!gameId || !gameId.startsWith('blur-')) {
                res.status(400).json({ message: 'Invalid blur game ID' });
                return;
            }

            const gameData = games[gameId];
            if (!gameData) {
                res.status(404).json({ message: 'Blur game not found' });
                return;
            }

            // Retorna apenas informações seguras do jogo (sem revelar a carta)
            res.status(200).json({
                gameId,
                gameMode: gameData.gameMode,
                maxBlurAttempts: gameData.maxBlurAttempts || -1,
                currentBlurAttempts: gameData.currentBlurAttempts || 0,
                cardImage: gameData.imageUrl || gameData.image_uris?.normal,
                startTime: gameData.startTime,
                initialBlur: gameData.initialBlur || 5,
                blurReduction: gameData.blurReduction || 0.10
            });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching blur game status', error });
        }
    }

    // Leaderboard endpoints
    public static async getNormalLeaderboard(req: Request, res: Response): Promise<void> {
        try {
            const limit = parseInt(req.query.limit as string) || 50;
            const leaderboard = await leaderboardService.getNormalLeaderboard(limit);
            res.status(200).json(leaderboard);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching normal leaderboard', error });
        }
    }

    public static async getBlurLeaderboard(req: Request, res: Response): Promise<void> {
        try {
            const limit = parseInt(req.query.limit as string) || 50;
            const blurMatchRepo = require('../repositories/blurMatchRepository').default;
            const leaderboard = await blurMatchRepo.getBlurLeaderboard(limit);
            res.status(200).json(leaderboard);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching blur leaderboard', error });
        }
    }

    public static async getBlurSpeedLeaderboard(req: Request, res: Response): Promise<void> {
        try {
            const limit = parseInt(req.query.limit as string) || 50;
            const blurMatchRepo = require('../repositories/blurMatchRepository').default;
            const leaderboard = await blurMatchRepo.getBlurSpeedLeaderboard(limit);
            res.status(200).json(leaderboard);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching blur speed leaderboard', error });
        }
    }

    public static async getBlurPerfectLeaderboard(req: Request, res: Response): Promise<void> {
        try {
            const limit = parseInt(req.query.limit as string) || 50;
            const blurMatchRepo = require('../repositories/blurMatchRepository').default;
            const leaderboard = await blurMatchRepo.getBlurPerfectLeaderboard(limit);
            res.status(200).json(leaderboard);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching blur perfect leaderboard', error });
        }
    }

    // Text mode leaderboards
    public static async getTextLeaderboard(req: Request, res: Response): Promise<void> {
        try {
            const limit = parseInt(req.query.limit as string) || 50;
            const textMatchRepo = require('../repositories/textMatchRepository').default;
            const leaderboard = await textMatchRepo.getTextLeaderboard(limit);
            res.status(200).json(leaderboard);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching text leaderboard', error });
        }
    }

    public static async getTextSpeedLeaderboard(req: Request, res: Response): Promise<void> {
        try {
            const limit = parseInt(req.query.limit as string) || 50;
            const textMatchRepo = require('../repositories/textMatchRepository').default;
            const leaderboard = await textMatchRepo.getTextSpeedLeaderboard(limit);
            res.status(200).json(leaderboard);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching text speed leaderboard', error });
        }
    }

    public static async getTextPerfectLeaderboard(req: Request, res: Response): Promise<void> {
        try {
            const limit = parseInt(req.query.limit as string) || 50;
            const textMatchRepo = require('../repositories/textMatchRepository').default;
            const leaderboard = await textMatchRepo.getTextPerfectLeaderboard(limit);
            res.status(200).json(leaderboard);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching text perfect leaderboard', error });
        }
    }

    public static async getUserTextStats(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const textMatchRepo = require('../repositories/textMatchRepository').default;
            const textStats = await textMatchRepo.getUserTextStats(userId);
            res.status(200).json(textStats);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching user text stats', error });
        }
    }

    public static async getDailyLeaderboard(req: Request, res: Response): Promise<void> {
        try {
            const limit = parseInt(req.query.limit as string) || 50;
            const leaderboard = await leaderboardService.getDailyLeaderboard(limit);
            res.status(200).json(leaderboard);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching daily leaderboard', error });
        }
    }

    public static async getSpeedLeaderboard(req: Request, res: Response): Promise<void> {
        try {
            const gameType = req.params.gameType as 'normal' | 'daily';
            const limit = parseInt(req.query.limit as string) || 50;
            
            if (gameType !== 'normal' && gameType !== 'daily') {
                res.status(400).json({ message: 'Invalid game type. Must be "normal" or "daily"' });
                return;
            }
            
            const leaderboard = await leaderboardService.getSpeedLeaderboard(gameType, limit);
            res.status(200).json(leaderboard);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching speed leaderboard', error });
        }
    }

    public static async getPerfectLeaderboard(req: Request, res: Response): Promise<void> {
        try {
            const gameType = req.params.gameType as 'normal' | 'daily';
            const limit = parseInt(req.query.limit as string) || 50;
            
            if (gameType !== 'normal' && gameType !== 'daily') {
                res.status(400).json({ message: 'Invalid game type. Must be "normal" or "daily"' });
                return;
            }
            
            const leaderboard = await leaderboardService.getPerfectLeaderboard(gameType, limit);
            res.status(200).json(leaderboard);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching perfect leaderboard', error });
        }
    }
}