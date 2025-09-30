import dailyMatchRepo from '../repositories/dailyMatchRepository';
import dailyCardRepo from '../repositories/dailyCardRepository';
import blurMatchRepo from '../repositories/blurMatchRepository';
import textMatchRepo from '../repositories/textMatchRepository';
import { maskCardNameInText } from '../utils/textUtils';
import matchRepo from '../repositories/matchRepository';
import { ScryfallService } from './scryfallService';
import coinsRepository from '../repositories/coinsRepository';

const scryfallService = new ScryfallService();

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
    difficulty?: 'easy' | 'medium' | 'hard';
}

// Função para calcular recompensas baseada na dificuldade
function getCoinReward(difficulty: string = 'medium', gameMode: string = 'normal', attempts: number = 1): number {
    let baseReward = 0;
    
    // Recompensa base por dificuldade no modo normal
    switch (difficulty) {
        case 'easy':
            baseReward = 1;
            break;
        case 'hard':
            baseReward = 10;
            break;
        case 'medium':
        default:
            baseReward = 3;
            break;
    }
    
    // Multiplicadores por modo de jogo (exceto daily que tem lógica própria)
    const modeMultipliers: Record<string, number> = {
        'normal': 1,
        'blur': 1.5,    // Modo blur é mais difícil
        'text': 1.2     // Modo texto é moderadamente difícil
    };
    
    const multiplier = modeMultipliers[gameMode] || 1;
    
    // Bônus por acertar na primeira tentativa
    const perfectBonus = attempts === 1 ? Math.ceil(baseReward * 0.5) : 0;
    
    return Math.ceil(baseReward * multiplier) + perfectBonus;
}

export async function processGuessCard(params: GuessCardParams) {
    let { gameId, guess, userId, name, email, attempts, timeSpent, games } = params;
    // Garante que name nunca seja vazio
    if (!name || name.trim() === '') {
        name = email || 'Usuário';
    }
    let targetCard;
    if (gameId === 'daily' || gameId.startsWith('daily-')) {
        // Extrai a data do gameId (daily-YYYY-MM-DD) ou usa hoje como fallback
        let gameDate: string;
        if (gameId.startsWith('daily-') && gameId.length === 16) {
            gameDate = gameId.substring(6); // Remove "daily-" prefix
        } else {
            gameDate = new Date().toISOString().slice(0, 10);
        }
        
        const dailyCard = await dailyCardRepo.getDailyCard(gameDate);
        if (!dailyCard) {
            throw new Error(`No daily card set for ${gameDate}.`);
        }
        const cards = await scryfallService.fetchCardByParam('name', dailyCard.cardName);
        targetCard = cards.length > 0 ? scryfallService.convertToLegacyFormat(cards[0]) : null;
        if (!targetCard) {
            throw new Error(`Could not fetch card: ${dailyCard.cardName}`);
        }

        // Checa se já jogou a daily nesta data específica
        if (userId && typeof userId === 'string') {
            const alreadyPlayed = await dailyMatchRepo.findByUserAndDate(userId, gameDate);
            if (alreadyPlayed) {
                throw new Error(`Você já jogou a daily de ${gameDate}.`);
            }
        }
    } else {
        targetCard = games[gameId];
        if (!targetCard) {
            throw new Error('No game in progress for this gameId. Please start a new game.');
        }
        
        // Se é modo blur, atualizar tentativas de blur
        if (targetCard.gameMode === 'blur' && gameId.startsWith('blur-')) {
            targetCard.currentBlurAttempts = (targetCard.currentBlurAttempts || 0) + 1;
        }
    }
    if (!guess || typeof guess !== 'string') {
        throw new Error('Guess must be a string (card name)');
    }
    const guessedCards = await scryfallService.fetchCardByParam('name', guess);
    const guessedCard = guessedCards.length > 0 ? scryfallService.convertToLegacyFormat(guessedCards[0]) : null;
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
    // Tipo - melhorada para detectar tipos principais e subtipos
    if (guessedCard.type && typeof guessedCard.type === 'string') {
        if (guessedCard.type === targetInfo.type) {
            feedback.type = 'correct';
        } else {
            // Normaliza os tipos (remove acentos, lowercase, etc.)
            const guessedType = guessedCard.type.toLowerCase().trim();
            const targetType = targetInfo.type.toLowerCase().trim();
            
            // Lista de tipos principais de Magic
            const mainTypes = ['artifact', 'creature', 'enchantment', 'instant', 'land', 'planeswalker', 'sorcery', 'tribal'];
            
            // Verifica se ambas as cartas compartilham pelo menos um tipo principal
            const guessedMainTypes = mainTypes.filter(type => guessedType.includes(type));
            const targetMainTypes = mainTypes.filter(type => targetType.includes(type));
            
            const hasMatchingMainType = guessedMainTypes.some(type => targetMainTypes.includes(type));
            
            if (hasMatchingMainType) {
                feedback.type = 'partial';
            } else if (guessedCard.type.includes(targetInfo.type) || targetInfo.type.includes(guessedCard.type)) {
                feedback.type = 'partial';
            } else {
                feedback.type = 'incorrect';
            }
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
    
    // Normaliza raridades (Scryfall usa "Mythic" mas queremos "Mythic Rare")
    const normalizeRarity = (rarity: string) => {
        if (rarity === 'Mythic') return 'Mythic Rare';
        return rarity;
    };
    
    const guessedRarityIndex = rarityOrder.indexOf(normalizeRarity(guessedCard.rarity));
    const targetRarityIndex = rarityOrder.indexOf(normalizeRarity(targetInfo.rarity));
    if (guessedCard.rarity === targetInfo.rarity) {
        feedback.rarity = 'correct';
    } else if (guessedRarityIndex > -1 && targetRarityIndex > -1) {
        if (guessedRarityIndex < targetRarityIndex) {
            // Carta palpite é menos rara que a correta -> precisa de mais rara (seta para cima)
            feedback.rarity = 'more rare';
        } else if (guessedRarityIndex > targetRarityIndex) {
            // Carta palpite é mais rara que a correta -> precisa de menos rara (seta para baixo)
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
    const isCorrect = scryfallService.validateGuess(guessedCard.name, targetCard.name);
    feedback.text = maskCardNameInText(targetCard.text, targetCard.name);
    feedback.flavor = typeof targetCard.flavor === 'string' ? targetCard.flavor : undefined;
    
    // Adicionar informações específicas do modo blur
    if (targetCard.gameMode === 'blur') {
        const initialBlur = targetCard.initialBlur || 5;
        const blurReduction = targetCard.blurReduction || 0.10;
        const currentAttempts = targetCard.currentBlurAttempts || 0;
        
        // Cálculo: blur inicial * (1 - redução)^tentativas
        // Exemplo: 5 * (0.9)^3 = 5 * 0.729 = 3.645px
        const currentBlurLevel = Math.max(0, initialBlur * Math.pow(1 - blurReduction, currentAttempts));
        
        feedback.blurInfo = {
            currentAttempts: currentAttempts,
            maxAttempts: -1, // Sem limite
            blurLevel: currentBlurLevel,
            initialBlur: initialBlur,
            blurReduction: blurReduction
        };
    }
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
            // Determinar dificuldade e modo do jogo
            const gameDifficulty = targetCard.difficulty || params.difficulty || 'medium';
            const gameMode = targetCard.gameMode || 'normal';
            
            // Salvar no repositório específico baseado no modo
            if (targetCard.gameMode === 'blur') {
                await blurMatchRepo.saveBlurMatch({ 
                    userId, 
                    name, 
                    email, 
                    cardName: targetCard.name, 
                    attempts, 
                    timeSpent,
                    blurAttempts: targetCard.currentBlurAttempts || 0,
                    maxBlurAttempts: targetCard.maxBlurAttempts || -1
                } as any);
            } else if (targetCard.gameMode === 'text') {
                await textMatchRepo.saveTextMatch({
                    userId,
                    name,
                    email,
                    cardName: targetCard.name,
                    attempts,
                    timeSpent
                } as any);
            } else {
                // Modo normal
                await matchRepo.saveMatch({ userId, name, email, cardName: targetCard.name, attempts, timeSpent } as any);
            }
            
            // Sistema de recompensas de moedas
            try {
                const coinReward = getCoinReward(gameDifficulty, gameMode, attempts);
                const rewardReason = `${gameMode}_win`;
                const description = `Vitória no modo ${gameMode} (${gameDifficulty}) - ${attempts} tentativa${attempts > 1 ? 's' : ''}`;
                
                await coinsRepository.addCoins(
                    userId,
                    coinReward,
                    rewardReason,
                    description,
                    {
                        gameId,
                        cardName: targetCard.name,
                        attempts,
                        timeSpent,
                        difficulty: gameDifficulty,
                        gameMode
                    }
                );
                
                console.log(`💰 Usuário ${userId} ganhou ${coinReward} moedas por vitória em ${gameMode} (${gameDifficulty})`);
                
                // Buscar novo saldo para retornar na resposta
                const userCoins = await coinsRepository.getUserCoins(userId);
                const coinInfo = {
                    coinsEarned: coinReward,
                    rewardType: rewardReason,
                    newBalance: userCoins?.balance || 0,
                    rewardDescription: description
                };
                
                return {
                    feedback,
                    isCorrect,
                    guessedCard,
                    coinReward: coinInfo
                };
            } catch (coinError) {
                console.error('Erro ao adicionar moedas:', coinError);
                // Não falha o jogo se houve erro nas moedas
            }
        } catch (err) {
            console.error('Erro ao salvar partida:', err);
        }
        // Remove o gameId do objeto games para liberar memória
        if (gameId !== 'daily' && !gameId.startsWith('daily-') && games && games[gameId]) {
            delete games[gameId];
        }
    }
    // Modo diário: salvar partida diária (impede duplicidade pelo index)
    if (isCorrect && (gameId === 'daily' || gameId.startsWith('daily-')) && userId && name && email && typeof attempts === 'number' && typeof timeSpent === 'number') {
        try {
            // Extrai a data do gameId ou usa hoje
            let gameDate: string;
            if (gameId.startsWith('daily-') && gameId.length === 16) {
                gameDate = gameId.substring(6);
            } else {
                gameDate = new Date().toISOString().slice(0, 10);
            }
            await dailyMatchRepo.saveDailyMatch({ userId, name, email, date: gameDate, cardName: targetCard.name, attempts, timeSpent });
            
            // Sistema de recompensas específico para modo diário
            try {
                // Verificar se está jogando no mesmo dia
                const today = new Date().toISOString().slice(0, 10);
                const isPlayingToday = gameDate === today;
                
                // Recompensa baseada se é mesmo dia ou retroativo
                const dailyCoinReward = isPlayingToday ? 30 : 1;
                const rewardType = isPlayingToday ? 'daily_current' : 'daily_retroactive';
                const description = isPlayingToday 
                    ? `Vitória no modo diário (mesmo dia) - ${attempts} tentativa${attempts > 1 ? 's' : ''} (${gameDate})`
                    : `Vitória no modo diário (retroativo) - ${attempts} tentativa${attempts > 1 ? 's' : ''} (${gameDate})`;
                
                await coinsRepository.addCoins(
                    userId,
                    dailyCoinReward,
                    rewardType,
                    description,
                    {
                        gameId,
                        cardName: targetCard.name,
                        attempts,
                        timeSpent,
                        gameDate,
                        gameMode: 'daily',
                        isRetroactive: !isPlayingToday,
                        playedOn: today
                    }
                );
                
                if (isPlayingToday) {
                    console.log(`🌟 Usuário ${userId} ganhou ${dailyCoinReward} moedas por vitória diária (MESMO DIA) em ${gameDate}`);
                } else {
                    console.log(`📅 Usuário ${userId} ganhou ${dailyCoinReward} moeda por vitória diária (RETROATIVO) em ${gameDate}`);
                }
                
                // Buscar novo saldo para retornar na resposta
                const userCoins = await coinsRepository.getUserCoins(userId);
                const coinInfo = {
                    coinsEarned: dailyCoinReward,
                    rewardType,
                    newBalance: userCoins?.balance || 0,
                    rewardDescription: description
                };
                
                return {
                    feedback,
                    isCorrect,
                    guessedCard,
                    coinReward: coinInfo
                };
            } catch (coinError) {
                console.error('Erro ao adicionar moedas diárias:', coinError);
            }
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