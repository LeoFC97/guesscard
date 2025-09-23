// Serviço para buscar nomes de cartas do Magic para autocomplete

export async function fetchCardNames(query: string): Promise<string[]> {
    if (!query || query.length < 2) return [];
    // Usando Scryfall API para autocomplete global
    const response = await fetch(`https://api.scryfall.com/cards/autocomplete?q=${encodeURIComponent(query)}`);
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data.data) ? data.data : [];
}
