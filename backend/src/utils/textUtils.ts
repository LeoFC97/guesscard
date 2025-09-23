// utils/textUtils.ts

/**
 * Substitui todas as ocorrências do nome da carta por <card_name> no texto.
 * @param text Texto original da carta
 * @param cardName Nome da carta
 * @returns Texto com nome substituído
 */
export function maskCardNameInText(text: string | undefined, cardName: string | undefined): string | undefined {
    if (typeof text !== 'string' || typeof cardName !== 'string') return text;
    const nameRegex = new RegExp(cardName, 'gi');
    return text.replace(nameRegex, '<card_name>');
}
