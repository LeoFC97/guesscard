// Configurações do sistema de dicas
export const HINT_CONFIG = {
    // Custos das dicas (em moedas)
    COSTS: {
        mana_cost: 10,
        card_type: 10
    },

    // Descrições das dicas
    DESCRIPTIONS: {
        mana_cost: 'Dica do custo de mana',
        card_type: 'Dica do tipo da carta'
    },

    // Tipos válidos de dica
    VALID_TYPES: ['mana_cost', 'card_type'] as const,

    // Rate limiting (por usuário)
    RATE_LIMIT: {
        maxRequestsPerHour: 30,
        maxRequestsPerMinute: 5
    },

    // Configurações gerais
    DEFAULT_COST: 1,
    MAX_HINTS_PER_GAME: 10
} as const;

export type HintType = typeof HINT_CONFIG.VALID_TYPES[number];

// Função helper para validar tipo de dica
export function isValidHintType(type: string): type is HintType {
    return HINT_CONFIG.VALID_TYPES.includes(type as HintType);
}

// Função helper para obter custo de uma dica
export function getHintCost(hintType: HintType): number {
    return HINT_CONFIG.COSTS[hintType] || HINT_CONFIG.DEFAULT_COST;
}

// Função helper para obter descrição de uma dica
export function getHintDescription(hintType: HintType): string {
    return HINT_CONFIG.DESCRIPTIONS[hintType] || 'Dica desconhecida';
}