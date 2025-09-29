import dailyMatchRepo from '../repositories/dailyMatchRepository';
import dailyCardRepo from '../repositories/dailyCardRepository';
import { maskCardNameInText } from '../utils/textUtils';
import matchRepo from '../repositories/matchRepository';
import { MtgService } from './mtgService';

const mtgService = new MtgService();

export interface CardInfo {
    colors: string[];
    type: string;
    cmc: number;
    setName: string;
    rarity: string;
    artist: string;
    legalities?: Record<string, string>;
}

export interface GuessCardParams {
    gameId: string;
    guess: string;
    userId?: string;
    name?: string;
    email?: string;
    attempts?: number;
    timeSpent?: number;
    games: Record<string, any>;
}

export async function processGuessCard(params: GuessCardParams) {
    let { gameId, guess, userId, name, email, attempts, timeSpent, games } = params;
    // Garante que name nunca seja vazio
    if (!name || name.trim() === '') {
        name = email || 'Usuário';
    }
    let targetCard;
    if (gameId === 'daily') {
        const today = new Date().toISOString().slice(0, 10);
        const dailyCard = await dailyCardRepo.getDailyCard(today);
        if (!dailyCard) {
            throw new Error('No daily card set for today.');
        }
        const cards = await mtgService.fetchCardByParam('name', dailyCard.cardName);
        targetCard = cards.length > 0 ? cards[0] : null;
        if (!targetCard) {
            throw new Error(`Could not fetch card: ${dailyCard.cardName}`);
        }

        // Checa se já jogou a daily hoje
        if (userId && typeof userId === 'string') {
            const alreadyPlayed = await dailyMatchRepo.findByUserAndDate(userId, today);
            if (alreadyPlayed) {
                throw new Error('Você já jogou a daily de hoje.');
            }
        }
    } else {
        targetCard = games[gameId];
        if (!targetCard) {
            throw new Error('No game in progress for this gameId. Please start a new game.');
        }
    }
    if (!guess || typeof guess !== 'string') {
        throw new Error('Guess must be a string (card name)');
    }
    const guessedCards = await mtgService.fetchCardByParam('name', guess);
    const guessedCard = guessedCards[0];
    if (!guessedCard) {
        throw new Error('Guessed card not found');
    }
    const targetInfo: CardInfo = {
        colors: targetCard.colors || [],
        type: targetCard.type || '',
        cmc: targetCard.cmc || 0,
        setName: targetCard.setName || '',
        rarity: targetCard.rarity || '',
        artist: targetCard.artist || '',
        legalities: targetCard.legalities || undefined
    };
    const feedback: any = {};
    // Cores
    const guessedColorsArr = Array.isArray(guessedCard.colors) ? guessedCard.colors : [];
    const targetColorsArr = Array.isArray(targetInfo.colors) ? targetInfo.colors : [];
    if ((guessedColorsArr.length === 0 && targetColorsArr.length === 0) || (!guessedCard.colors && !targetInfo.colors)) {
        feedback.colors = 'correct';
    } else if (guessedColorsArr.length === 0 || targetColorsArr.length === 0) {
        feedback.colors = 'incorrect';
    } else {
        const matchedColors = guessedColorsArr.filter((color: string) => targetColorsArr.includes(color));
        if (matchedColors.length === targetColorsArr.length && matchedColors.length === guessedColorsArr.length) {
            feedback.colors = 'correct';
        } else if (matchedColors.length > 0) {
            feedback.colors = 'partial';
        } else {
            feedback.colors = 'incorrect';
        }
    }
    // Tipo
    if (guessedCard.type && typeof guessedCard.type === 'string') {
        if (guessedCard.type === targetInfo.type) {
            feedback.type = 'correct';
        } else if (guessedCard.type.includes(targetInfo.type) || targetInfo.type.includes(guessedCard.type)) {
            feedback.type = 'partial';
        } else {
            feedback.type = 'incorrect';
        }
    } else {
        feedback.type = 'incorrect';
    }
    // CMC
    if (guessedCard.cmc === targetInfo.cmc) {
        feedback.cmc = 'correct';
    } else if (guessedCard.cmc < targetInfo.cmc) {
        feedback.cmc = 'higher';
    } else {
        feedback.cmc = 'lower';
    }
    // Edição
    if (guessedCard.setName === targetInfo.setName) {
        feedback.edition = 'correct';
    } else {
        feedback.edition = 'incorrect';
    }
    // Raridade
    const rarityOrder = ['Common', 'Uncommon', 'Rare', 'Mythic Rare'];
    const guessedRarityIndex = rarityOrder.indexOf(guessedCard.rarity);
    const targetRarityIndex = rarityOrder.indexOf(targetInfo.rarity);
    if (guessedCard.rarity === targetInfo.rarity) {
        feedback.rarity = 'correct';
    } else if (guessedRarityIndex > -1 && targetRarityIndex > -1) {
        if (guessedRarityIndex > targetRarityIndex) {
            feedback.rarity = 'more rare';
        } else if (guessedRarityIndex < targetRarityIndex) {
            feedback.rarity = 'less rare';
        } else {
            feedback.rarity = 'incorrect';
        }
    } else {
        feedback.rarity = 'incorrect';
    }
    // Artista
    if (guessedCard.artist && typeof guessedCard.artist === 'string') {
        if (guessedCard.artist === targetInfo.artist) {
            feedback.artist = 'correct';
        } else if (guessedCard.artist.includes(targetInfo.artist) || targetInfo.artist.includes(guessedCard.artist)) {
            feedback.artist = 'partial';
        } else {
            feedback.artist = 'incorrect';
        }
    } else {
        feedback.artist = 'incorrect';
    }
    // Verifica se acertou
    const isCorrect = mtgService.validateGuess(guessedCard.name, targetCard.name);
    feedback.text = maskCardNameInText(targetCard.text, targetCard.name);
    feedback.flavor = typeof targetCard.flavor === 'string' ? targetCard.flavor : undefined;
    // Legalities
    if (Array.isArray(targetCard.legalities)) {
        const legalitiesObj: Record<string, string> = {};
        for (const entry of targetCard.legalities) {
            if (entry.format && entry.legality) {
                legalitiesObj[entry.format.toLowerCase()] = entry.legality;
            }
        }
        feedback.legalities = legalitiesObj;
    } else if (typeof targetCard.legalities === 'object') {
        feedback.legalities = targetCard.legalities;
    } else {
        feedback.legalities = undefined;
    }
    if (typeof guessedCard.text !== 'string') {
        guessedCard.text = undefined;
    }
    guessedCard.legalities = feedback.legalities;
    // Persistir partida se acertou
    if (isCorrect && userId && name && email && typeof attempts === 'number' && typeof timeSpent === 'number') {
        try {
            await matchRepo.saveMatch({ userId, name, email, cardName: targetCard.name, attempts, timeSpent } as any);
        } catch (err) {
            console.error('Erro ao salvar partida:', err);
        }
        // Remove o gameId do objeto games para liberar memória
        if (gameId !== 'daily' && games && games[gameId]) {
            delete games[gameId];
        }
    }
    // Modo diário: salvar partida diária (impede duplicidade pelo index)
    if (isCorrect && gameId === 'daily' && userId && name && email && typeof attempts === 'number' && typeof timeSpent === 'number') {
        try {
            const today = new Date().toISOString().slice(0, 10);
            await dailyMatchRepo.saveDailyMatch({ userId, name, email, date: today, cardName: targetCard.name, attempts, timeSpent });
        } catch (err: any) {
            if (err.code === 11000) {
                // Duplicate key error: já jogou
                throw new Error('Você já jogou a daily de hoje.');
            }
            console.error('Erro ao salvar daily match:', err);
        }
    }
    return {
        feedback,
        isCorrect,
        guessedCard
    };
}