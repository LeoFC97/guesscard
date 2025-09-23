import { Request, Response } from 'express';
import { MtgService } from '../services/mtgService';

export interface CardInfo {
    colors: string[];      // Ex: ["Red"]
    type: string;          // Ex: "Instant"
    cmc: number;           // Ex: 1
    setName: string;       // Ex: "Magic 2010"
    rarity: string;        // Ex: "Common"
    artist: string;        // Ex: "Christopher Moeller"
}

export class MtgController {
    private mtgService: MtgService;

    constructor() {
        this.mtgService = new MtgService();
    }

    public async getCard(req: Request, res: Response): Promise<void> {
        try {
            const cardName = req.params.name;
            const card = await this.mtgService.fetchCardByParam("name", cardName);
            res.status(200).json(card);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching card', error });
        }
    }

    public async guessCard(req: Request, res: Response): Promise<void> {
        try {
            const { guess } = req.body;
            if (!guess || typeof guess !== 'string') {
                res.status(400).json({ message: 'Guess must be a string (card name)' });
                return;
            }

            // Busca apenas a carta do palpite (guess)
            const guessedCards = await this.mtgService.fetchCardByParam("name", guess);
            const guessedCard = guessedCards[0];

            if (!guessedCard) {
                res.status(404).json({ message: 'Guessed card not found' });
                return;
            }

            const hardCodedCard: CardInfo = {
                colors: ["U"],
                type: "Instant",
                cmc: 3,
                setName: "Double Masters 2022",
                rarity: "Rare",
                artist: "Paul Scott Canavan"
            };

            const feedback: any = {};

            // Validação de cores (parcial se acertar pelo menos uma cor)
            if (guessedCard.colors && Array.isArray(guessedCard.colors)) {
                const matchedColors = guessedCard.colors.filter((color: string) =>
                    hardCodedCard.colors.includes(color)
                );
                if (matchedColors.length === hardCodedCard.colors.length && matchedColors.length === guessedCard.colors.length) {
                    feedback.colors = "correct";
                } else if (matchedColors.length > 0) {
                    feedback.colors = "partial";
                } else {
                    feedback.colors = "incorrect";
                }
            } else {
                feedback.colors = "incorrect";
            }

            // Validação de tipo (parcial se contém substring)
            if (guessedCard.type && typeof guessedCard.type === "string") {
                if (guessedCard.type === hardCodedCard.type) {
                    feedback.type = "correct";
                } else if (guessedCard.type.includes(hardCodedCard.type) || hardCodedCard.type.includes(guessedCard.type)) {
                    feedback.type = "partial";
                } else {
                    feedback.type = "incorrect";
                }
            } else {
                feedback.type = "incorrect";
            }

            // Validação de CMC
            if (guessedCard.cmc === hardCodedCard.cmc) {
                feedback.cmc = "correct";
            } else if (guessedCard.cmc > hardCodedCard.cmc) {
                feedback.cmc = "higher";
            } else {
                feedback.cmc = "lower";
            }

            // Validação de edição
            if (guessedCard.setName === hardCodedCard.setName) {
                feedback.edition = "correct";
            } else {
                feedback.edition = "incorrect";
            }

            // Validação de raridade (parcial se for mais ou menos rara)
            const rarityOrder = ["Common", "Uncommon", "Rare", "Mythic Rare"];
            const guessedRarityIndex = rarityOrder.indexOf(guessedCard.rarity);
            const targetRarityIndex = rarityOrder.indexOf(hardCodedCard.rarity);

            if (guessedCard.rarity === hardCodedCard.rarity) {
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
                if (guessedCard.artist === hardCodedCard.artist) {
                    feedback.artist = "correct";
                } else if (guessedCard.artist.includes(hardCodedCard.artist) || hardCodedCard.artist.includes(guessedCard.artist)) {
                    feedback.artist = "partial";
                } else {
                    feedback.artist = "incorrect";
                }
            } else {
                feedback.artist = "incorrect";
            }

            guessedCard.feedback = feedback;

            // Verifica se o palpite está correto
            const isCorrect = this.mtgService.validateGuess(guessedCard.name, "Lightning Bolt");
            guessedCard.isCorrect = isCorrect;

            res.status(200).json({ feedback, guessedCard });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Error processing guess', error });
        }
    }
}