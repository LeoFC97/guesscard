// utils/textUtils.ts

/**
 * Substitui todas as ocorrências do nome da carta por símbolos de censura no texto.
 * @param text Texto original da carta
 * @param cardName Nome da carta
 * @returns Texto com nome censurado
 */
export function maskCardNameInText(text: string | undefined, cardName: string | undefined): string | undefined {
    if (typeof text !== 'string' || typeof cardName !== 'string') return text;
    
    // Remove caracteres especiais do nome para regex mais robusta
    const cleanName = cardName.replace(/[^a-zA-Z0-9\s]/g, '').trim();
    
    // Criar padrões para o nome completo e palavras individuais
    const patterns = [cleanName]; // Nome completo primeiro
    const words = cleanName.split(/\s+/).filter(word => word.length > 2);
    patterns.push(...words);
    
    let censoredText = text;
    
    // Aplicar censura para cada padrão
    patterns.forEach(pattern => {
        const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
        const censored = '█'.repeat(pattern.length);
        censoredText = censoredText.replace(regex, censored);
    });
    
    return censoredText;
}
