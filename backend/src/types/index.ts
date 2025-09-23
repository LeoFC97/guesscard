export interface Card {
    id: string;
    name: string;
    manaCost?: string;
    type: string;
    rarity: string;
    set: string;
    text: string;
}

export interface GuessResult {
    correct: boolean;
    message: string;
    card?: Card;
}