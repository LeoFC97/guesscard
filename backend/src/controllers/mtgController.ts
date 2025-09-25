// Mapeamento em memória para partidas: { [gameId]: targetCard }
const games: Record<string, any> = {};
// Modo diário: armazena carta do dia em memória

let dailyCard: any = null;
let dailyDate: string | null = null;


import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { MtgService } from '../services/mtgService';
import { maskCardNameInText } from '../utils/textUtils';
import { extractEditionsAndIcons } from '../utils/editionUtils';

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

const mtgService = new MtgService();

const randomCardNames = [
    // Modern staples
    'Lightning Bolt',
    'Ragavan, Nimble Pilferer',
    'Fury',
    'Solitude',
    'Wrenn and Six',
    'Murktide Regent',
    'Expressive Iteration',
    'Thoughtseize',
    'Scalding Tarn',
    'Misty Rainforest',
    'Verdant Catacombs',
    'Marsh Flats',
    'Arid Mesa',
    'Bloodstained Mire',
    'Wooded Foothills',
    'Windswept Heath',
    'Polluted Delta',
    'Flooded Strand',
    'Prismatic Vista',
    'Mishra’s Bauble',
    'Urza’s Saga',
    'Primeval Titan',
    'Karn, the Great Creator',
    'Blood Moon',
    'Liliana of the Veil',
    'Tarmogoyf',
    'Snapcaster Mage',
    'Path to Exile',
    'Engineered Explosives',
    'Collected Company',
    'Archmage’s Charm',
    'Seasoned Pyromancer',
    'Dismember',
    'Inquisition of Kozilek',
    'Abrupt Decay',
    'Teferi, Time Raveler',
    'Force of Negation',
    'Prismatic Ending',
    'Yawgmoth, Thran Physician',
    'Omnath, Locus of Creation',
    'Consign to Memory',
    'Nicol Bolas, the Ravager',
    'Ugin, the Spirit Dragon',
    'Teferi, Hero of Dominaria',
    'Chandra, Torch of Defiance',
    'Jace, the Mind Sculptor',
    'Emrakul, the Aeons Torn',
    'Karn Liberated',
    'Gideon Jura',
    // Belcher
    'Goblin Charbelcher',
    'Manamorphose',
    'Desperate Ritual',
    'Pyretic Ritual',
    'Land Grant',
    // Monored Burn
    'Monastery Swiftspear',
    'Eidolon of the Great Revel',
    'Lava Spike',
    'Rift Bolt',
    'Skewer the Critics',
    'Searing Blaze',
    'Searing Blood',
    'Boros Charm',
    'Lightning Helix',
    'Goblin Guide',
    'Roiling Vortex',
    // Storm
    'Grapeshot',
    'Past in Flames',
    'Goblin Electromancer',
    'Serum Visions',
    'Sleight of Hand',
    'Wish',
    // Amulet Titan
    'Amulet of Vigor',
    'Summoner’s Pact',
    'Primeval Titan',
    'Tolaria West',
    'Simic Growth Chamber',
    'Cultivator Colossus',
    // Prowess
    'Monastery Swiftspear',
    'Light Up the Stage',
    'Bedlam Reveler',
    'Mutagenic Growth',
    'Gut Shot',
    // Pauper staples
    'Mulldrifter',
    'Gurmag Angler',
    'Augur of Bolas',
    'Serrated Arrows',
    'Burning-Tree Emissary',
    'Skred',
    'Delver of Secrets',
    'Spellstutter Sprite',
    'Preordain',
    'Ponder',
    'Counterspell',
    'Llanowar Elves',
    'Dark Ritual',
    'Giant Growth',
    'Shivan Dragon',
    'Swords to Plowshares',
    'Wrath of God',
    'Birds of Paradise',
    'Demonic Tutor',
    'Sol Ring',
    'Black Lotus',
    'Time Walk',
    'Ancestral Recall',
    'Bloodbraid Elf'
];

export async function pickRandomCard() {
    const randomIndex = Math.floor(Math.random() * randomCardNames.length);
    const cardName = randomCardNames[randomIndex];
    const cards = await mtgService.fetchCardByParam('name', cardName);
    if (cards.length > 0) {
        return cards[0];
    } else {
        return null;
    }
}

export interface CardInfo {
    colors: string[];      // Ex: ["Red"]
    type: string;          // Ex: "Instant"
    cmc: number;           // Ex: 1
    setName: string;       // Ex: "Magic 2010"
    rarity: string;        // Ex: "Common"
    artist: string;        // Ex: "Christopher Moeller"
    legalities?: Record<string, string>; // Ex: { modern: "Legal", legacy: "Banned", ... }
}

export class MtgController {
    private mtgService: MtgService;

    constructor() {
        this.mtgService = new MtgService();
    }

    // Endpoint para modo diário
    public static async dailyGame(req: Request, res: Response): Promise<void> {
        try {
            // Sempre retorna Black Lotus como carta diária
            const today = new Date().toISOString().slice(0, 10); // yyyy-mm-dd
            const cards = await mtgService.fetchCardByParam('name', 'Black Lotus');
            const blackLotus = cards.length > 0 ? cards[0] : null;
            if (!blackLotus) {
                res.status(500).json({ message: 'Could not fetch Black Lotus' });
                return;
            }
            res.status(200).json({ message: 'Daily game', cardName: blackLotus.name, date: today });
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
            const { gameId, guess } = req.body;
            if (!gameId || typeof gameId !== 'string') {
                res.status(400).json({ message: 'Missing or invalid gameId.' });
                return;
            }
            let targetCard;
            if (gameId === 'daily') {
                // Sempre retorna Black Lotus como carta do dia
                const cards = await mtgService.fetchCardByParam('name', 'Black Lotus');
                targetCard = cards.length > 0 ? cards[0] : null;
                if (!targetCard) {
                    res.status(500).json({ message: 'Could not fetch Black Lotus' });
                    return;
                }
            } else {
                targetCard = games[gameId];
                if (!targetCard) {
                    res.status(400).json({ message: 'No game in progress for this gameId. Please start a new game.' });
                    return;
                }
            }
            if (!guess || typeof guess !== 'string') {
                res.status(400).json({ message: 'Guess must be a string (card name)' });
                return;
            }

            const guessedCards = await this.mtgService.fetchCardByParam("name", guess);
            const guessedCard = guessedCards[0];

            if (!guessedCard) {
                res.status(404).json({ message: 'Guessed card not found' });
                return;
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

            // Corrige para considerar ambas as cartas incolores como corretas
            const guessedColorsArr = Array.isArray(guessedCard.colors) ? guessedCard.colors : [];
            const targetColorsArr = Array.isArray(targetInfo.colors) ? targetInfo.colors : [];
            if ((guessedColorsArr.length === 0 && targetColorsArr.length === 0) ||
                (!guessedCard.colors && !targetInfo.colors)) {
                feedback.colors = "correct";
            } else if (guessedColorsArr.length === 0 || targetColorsArr.length === 0) {
                feedback.colors = "incorrect";
            } else {
                const matchedColors = guessedColorsArr.filter((color: string) =>
                    targetColorsArr.includes(color)
                );
                if (matchedColors.length === targetColorsArr.length && matchedColors.length === guessedColorsArr.length) {
                    feedback.colors = "correct";
                } else if (matchedColors.length > 0) {
                    feedback.colors = "partial";
                } else {
                    feedback.colors = "incorrect";
                }
            }

            // Validação de tipo (parcial se contém substring)
            if (guessedCard.type && typeof guessedCard.type === "string") {
                if (guessedCard.type === targetInfo.type) {
                    feedback.type = "correct";
                } else if (guessedCard.type.includes(targetInfo.type) || targetInfo.type.includes(guessedCard.type)) {
                    feedback.type = "partial";
                } else {
                    feedback.type = "incorrect";
                }
            } else {
                feedback.type = "incorrect";
            }

            // Validação de CMC
            if (guessedCard.cmc === targetInfo.cmc) {
                feedback.cmc = "correct";
            } else if (guessedCard.cmc < targetInfo.cmc) {
                feedback.cmc = "higher";
            } else {
                feedback.cmc = "lower";
            }

            // Validação de edição
            if (guessedCard.setName === targetInfo.setName) {
                feedback.edition = "correct";
            } else {
                feedback.edition = "incorrect";
            }

            // Validação de raridade (parcial se for mais ou menos rara)
            const rarityOrder = ["Common", "Uncommon", "Rare", "Mythic Rare"];
            const guessedRarityIndex = rarityOrder.indexOf(guessedCard.rarity);
            const targetRarityIndex = rarityOrder.indexOf(targetInfo.rarity);

            if (guessedCard.rarity === targetInfo.rarity) {
                feedback.rarity = "correct";
            } else if (guessedRarityIndex > -1 && targetRarityIndex > -1) {
                if (guessedRarityIndex > targetRarityIndex) {
                    feedback.rarity = "more rare";
                } else if (guessedRarityIndex < targetRarityIndex) {
                    feedback.rarity = "less rare";
                } else {
                    feedback.rarity = "incorrect";
                }
            } else {
                feedback.rarity = "incorrect";
            }

            // Validação de artista (parcial se contém substring)
            if (guessedCard.artist && typeof guessedCard.artist === "string") {
                if (guessedCard.artist === targetInfo.artist) {
                    feedback.artist = "correct";
                } else if (guessedCard.artist.includes(targetInfo.artist) || targetInfo.artist.includes(guessedCard.artist)) {
                    feedback.artist = "partial";
                } else {
                    feedback.artist = "incorrect";
                }
            } else {
                feedback.artist = "incorrect";
            }

            // Verifica se o palpite está correto
            const isCorrect = this.mtgService.validateGuess(guessedCard.name, targetCard.name);

            feedback.text = maskCardNameInText(targetCard.text, targetCard.name);
            feedback.flavor = typeof targetCard.flavor === 'string' ? targetCard.flavor : undefined;
            // Sempre retorna legalities da carta alvo (targetCard)
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
            // Garante que guessedCard.legalities também seja da carta alvo
            guessedCard.legalities = feedback.legalities;

            // // Persistir partida se acertou
            // if (isCorrect) {
            //     // Dados do usuário devem ser enviados pelo frontend
            //     const { userId, name, email, attempts, timeSpent } = req.body;
            //     try {
            //         const { saveMatch } = require('../match');
            //         saveMatch({ userId, name, email, cardName: targetCard.name, attempts, timeSpent });
            //     } catch (err) {
            //         // loga erro mas não bloqueia resposta
            //         console.error('Erro ao salvar partida:', err);
            //     }
            // }

            res.status(200).json({
                feedback,
                isCorrect,
                guessedCard
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Error processing guess', error });
        }
    }

    // Novo endpoint para sortear uma nova carta
    public static async newGame(req: Request, res: Response): Promise<void> {
        try {
            // Recebe dificuldade do body
            const { difficulty } = req.body;
            let cardList: string[];
            // Importa listas de dificuldade
            const { easyCards, mediumCards, hardCards } = require('../cardDifficulties');
            if (difficulty === 'easy') {
                cardList = easyCards;
            } else if (difficulty === 'hard') {
                cardList = hardCards;
            } else {
                cardList = mediumCards;
            }
            // Sorteia carta da lista
            const randomIndex = Math.floor(Math.random() * cardList.length);
            const cardName = cardList[randomIndex];
            const cards = await mtgService.fetchCardByParam('name', cardName);
            const targetCard = cards.length > 0 ? cards[0] : null;
            if (!targetCard) {
                res.status(500).json({ message: 'Could not pick a new card' });
                return;
            }
            // Gera um gameId único
            const gameId = randomUUID();
            games[gameId] = targetCard;
            res.status(200).json({ message: 'New game started', cardName: targetCard.name, gameId });
        } catch (error) {
            res.status(500).json({ message: 'Error starting new game', error });
        }
    }
}