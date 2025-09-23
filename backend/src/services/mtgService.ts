import axios from 'axios';

export class MtgService {
    private apiUrl: string;

    constructor() {
        this.apiUrl = 'https://api.magicthegathering.io/v1/cards';
    }

    public async fetchCardByParam(param: string, valueOfParam: string): Promise<any> {
        try {
            const url = `${this.apiUrl}?${encodeURIComponent(param)}=${encodeURIComponent(valueOfParam)}&pageSize=1`;
            const response = await axios.get(url);
            return response.data.cards;
        } catch (error) {
            throw new Error('Error fetching cards: ' + error);
        }
    }

    public validateGuess(cardName: string, correctCardName: string): boolean {
        return cardName.trim().toLowerCase() === correctCardName.trim().toLowerCase();
    }
}