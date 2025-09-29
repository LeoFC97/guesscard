export interface Card {
    id: string;
    name: string;
    manaCost?: string;
    type: string;
    rarity: string;
    set: string;
    setName?: string;
    text: string;
    flavor?: string;
    colors?: string[];
    cmc?: number;
    artist?: string;
    legalities?: Record<string, string>;
    imageUrl?: string;
    // Campos específicos do Scryfall para compatibilidade futura
    scryfall_id?: string;
    oracle_id?: string;
    released_at?: string;
    keywords?: string[];
    color_identity?: string[];
}

export interface GuessResult {
    correct: boolean;
    message: string;
    card?: Card;
}