import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { MtgService } from '../services/mtgService';
import matchRepo from '../repositories/matchRepository';
import dailyMatchRepo from '../repositories/dailyMatchRepository';
import dailyCardRepo from '../repositories/dailyCardRepository';
import { getUserStatsService } from '../services/userStatsService';

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
    private mtgService: MtgService;

    constructor() {
        this.mtgService = new MtgService();
    }

    // Endpoint: GET /api/user-stats/:userId
    public static async getUserStats(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            if (!userId) {
                res.status(400).json({ message: 'userId obrigatório' });
                return;
            }
            const stats = await getUserStatsService(userId);
            res.status(200).json(stats);
        } catch (error) {
            res.status(500).json({ message: 'Erro ao buscar estatísticas do usuário', error });
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
            const cards = await (new MtgService()).fetchCardByParam('name', dailyCardDoc.cardName);
            const card = cards.length > 0 ? cards[0] : null;
            if (!card) {
                res.status(500).json({ message: 'Could not fetch card for this day' });
                return;
            }
            res.status(200).json({ message: 'Daily game', cardName: card.name, date: dateStr });
        } catch (error) {
            res.status(500).json({ message: 'Error starting daily game', error });
        }
    }

    public async getCard(req: Request, res: Response): Promise<void> {
        try {
            const cardName = req.params.name.trim();
            const card = await this.mtgService.fetchCardByParam("name", cardName);
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
            const cards = await (new MtgService()).fetchCardByParam('name', cardName);
            const targetCard = cards.length > 0 ? cards[0] : null;
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
}