// Retorna lista de edições e ícones para uma carta
export function extractEditionsAndIcons(card: any): { editions: string[], icons: string[] } {
    // O MTG API retorna um array 'printings' com os códigos das edições
    // O campo 'set' é o código da edição principal
    // O campo 'setName' é o nome da edição principal
    // O campo 'set' pode ser usado para montar a URL do ícone
    // Exemplo de URL: https://gatherer.wizards.com/Handlers/Image.ashx?type=symbol&set={set}&size=small
    const editions: string[] = [];
    const icons: string[] = [];
    if (card.printings && Array.isArray(card.printings)) {
        for (const setCode of card.printings) {
            editions.push(setCode);
            icons.push(`https://gatherer.wizards.com/Handlers/Image.ashx?type=symbol&set=${setCode}&size=small`);
        }
    }
    return { editions, icons };
}
