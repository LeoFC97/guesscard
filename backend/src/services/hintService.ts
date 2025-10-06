import { ScryfallService } from './scryfallService';
import { HINT_CONFIG, HintType, getHintCost, getHintDescription, isValidHintType } from '../config/hintConfig';

export interface HintInfo {
    type: HintType;
    value: any;
    cost: number;
    description: string;
}

export class HintService {
    private scryfallService: ScryfallService;

    constructor() {
        this.scryfallService = new ScryfallService();
    }

    /**
     * Obter informações de dica para uma carta específica
     */
    async getHintInfo(cardName: string, hintType: HintType): Promise<HintInfo> {
        try {
            // Buscar dados da carta no Scryfall
            const cards = await this.scryfallService.fetchCardByParam('name', cardName);
            const cardData = cards.length > 0 ? this.scryfallService.convertToLegacyFormat(cards[0]) : null;

            if (!cardData) {
                throw new Error(`Card not found: ${cardName}`);
            }

            let value: any;
            let description: string;

            switch (hintType) {
                case 'mana_cost':
                    value = cardData.convertedManaCost || 0;
                    description = `Custo de mana da carta: ${value}`;
                    break;

                case 'card_type':
                    value = cardData.types?.[0] || 'Unknown';
                    description = `Tipo da carta: ${value}`;
                    break;

                default:
                    throw new Error(`Invalid hint type: ${hintType}`);
            }

            return {
                type: hintType,
                value,
                cost: getHintCost(hintType),
                description
            };

        } catch (error) {
            console.error(`Error getting hint info for ${cardName}:`, error);
            throw error;
        }
    }

    /**
     * Validar se um tipo de dica é válido
     */
    isValidHintType(hintType: string): hintType is HintType {
        return isValidHintType(hintType);
    }

    /**
     * Obter todas as dicas disponíveis
     */
    getAvailableHints(): Array<{type: HintType, cost: number, description: string}> {
        return HINT_CONFIG.VALID_TYPES.map(type => ({
            type,
            cost: getHintCost(type),
            description: getHintDescription(type)
        }));
    }
}

const hintService = new HintService();
export default hintService;