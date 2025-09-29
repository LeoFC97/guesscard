import axios from 'axios';

export interface ScryfallCard {
    id: string;
    oracle_id: string;
    name: string;
    lang: string;
    released_at: string;
    uri: string;
    scryfall_uri: string;
    layout: string;
    highres_image: boolean;
    image_status: string;
    image_uris?: {
        small: string;
        normal: string;
        large: string;
        png: string;
        art_crop: string;
        border_crop: string;
    };
    mana_cost?: string;
    cmc: number;
    type_line: string;
    oracle_text?: string;
    colors?: string[];
    color_identity: string[];
    keywords: string[];
    legalities: Record<string, string>;
    games: string[];
    reserved: boolean;
    foil: boolean;
    nonfoil: boolean;
    finishes: string[];
    oversized: boolean;
    promo: boolean;
    reprint: boolean;
    variation: boolean;
    set_id: string;
    set: string;
    set_name: string;
    set_type: string;
    set_uri: string;
    set_search_uri: string;
    scryfall_set_uri: string;
    rulings_uri: string;
    prints_search_uri: string;
    collector_number: string;
    digital: boolean;
    rarity: string;
    flavor_text?: string;
    card_back_id: string;
    artist?: string;
    artist_ids: string[];
    illustration_id?: string;
    border_color: string;
    frame: string;
    security_stamp?: string;
    full_art: boolean;
    textless: boolean;
    booster: boolean;
    story_spotlight: boolean;
    edhrec_rank?: number;
    penny_rank?: number;
    prices: {
        usd?: string;
        usd_foil?: string;
        usd_etched?: string;
        eur?: string;
        eur_foil?: string;
        tix?: string;
    };
    related_uris: {
        gatherer?: string;
        tcgplayer_infinite_articles?: string;
        tcgplayer_infinite_decks?: string;
        edhrec?: string;
    };
    purchase_uris: {
        tcgplayer?: string;
        cardmarket?: string;
        cardhoarder?: string;
    };
}

export interface ScryfallSearchResponse {
    object: string;
    total_cards: number;
    has_more: boolean;
    next_page?: string;
    data: ScryfallCard[];
    warnings?: string[];
}

export class ScryfallService {
    private apiUrl: string;
    private baseUrl: string;

    constructor() {
        this.baseUrl = 'https://api.scryfall.com';
        this.apiUrl = `${this.baseUrl}/cards`;
    }

    /**
     * Busca cartas por nome exato
     */
    public async fetchCardByName(cardName: string): Promise<ScryfallCard[]> {
        try {
            const url = `${this.apiUrl}/search?q=!"${encodeURIComponent(cardName)}"&unique=cards&order=released`;
            const response = await axios.get<ScryfallSearchResponse>(url);
            return response.data.data || [];
        } catch (error: any) {
            if (error.response?.status === 404) {
                // Carta não encontrada
                return [];
            }
            throw new Error('Error fetching card by name: ' + error.message);
        }
    }

    /**
     * Busca cartas usando parâmetros genéricos (mantém compatibilidade com API antiga)
     */
    public async fetchCardByParam(param: string, valueOfParam: string): Promise<ScryfallCard[]> {
        try {
            let searchQuery = '';
            
            // Mapeia parâmetros da API antiga para queries do Scryfall
            switch (param.toLowerCase()) {
                case 'name':
                    // Busca exata por nome
                    searchQuery = `!"${encodeURIComponent(valueOfParam)}"`;
                    break;
                case 'type':
                    searchQuery = `type:"${encodeURIComponent(valueOfParam)}"`;
                    break;
                case 'colors':
                    searchQuery = `color:"${encodeURIComponent(valueOfParam)}"`;
                    break;
                case 'cmc':
                    searchQuery = `cmc:${encodeURIComponent(valueOfParam)}`;
                    break;
                case 'set':
                    searchQuery = `set:"${encodeURIComponent(valueOfParam)}"`;
                    break;
                case 'rarity':
                    searchQuery = `rarity:"${encodeURIComponent(valueOfParam)}"`;
                    break;
                case 'artist':
                    searchQuery = `artist:"${encodeURIComponent(valueOfParam)}"`;
                    break;
                default:
                    // Para parâmetros não mapeados, faz uma busca genérica
                    searchQuery = encodeURIComponent(valueOfParam);
                    break;
            }

            const url = `${this.apiUrl}/search?q=${searchQuery}&unique=cards&order=released`;
            const response = await axios.get<ScryfallSearchResponse>(url);
            return response.data.data || [];
        } catch (error: any) {
            if (error.response?.status === 404) {
                // Nenhuma carta encontrada
                return [];
            }
            throw new Error('Error fetching cards: ' + error.message);
        }
    }

    /**
     * Busca uma carta aleatória
     */
    public async getRandomCard(): Promise<ScryfallCard | null> {
        try {
            const url = `${this.apiUrl}/random`;
            const response = await axios.get<ScryfallCard>(url);
            return response.data;
        } catch (error: any) {
            throw new Error('Error fetching random card: ' + error.message);
        }
    }

    /**
     * Busca carta por ID do Scryfall
     */
    public async getCardById(id: string): Promise<ScryfallCard | null> {
        try {
            const url = `${this.apiUrl}/${id}`;
            const response = await axios.get<ScryfallCard>(url);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return null;
            }
            throw new Error('Error fetching card by ID: ' + error.message);
        }
    }

    /**
     * Busca cartas com query avançada do Scryfall
     */
    public async searchCards(query: string, page: number = 1): Promise<ScryfallSearchResponse> {
        try {
            const url = `${this.apiUrl}/search?q=${encodeURIComponent(query)}&page=${page}&unique=cards&order=released`;
            const response = await axios.get<ScryfallSearchResponse>(url);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return {
                    object: 'list',
                    total_cards: 0,
                    has_more: false,
                    data: []
                };
            }
            throw new Error('Error searching cards: ' + error.message);
        }
    }

    /**
     * Valida se o nome da carta adivinhada está correto
     */
    public validateGuess(cardName: string, correctCardName: string): boolean {
        return cardName.trim().toLowerCase() === correctCardName.trim().toLowerCase();
    }

    /**
     * Converte uma carta do Scryfall para o formato usado internamente (compatibilidade)
     */
    public convertToLegacyFormat(scryfallCard: ScryfallCard): any {
        return {
            id: scryfallCard.id,
            name: scryfallCard.name,
            manaCost: scryfallCard.mana_cost,
            type: scryfallCard.type_line,
            rarity: this.capitalizeName(scryfallCard.rarity),
            set: scryfallCard.set.toUpperCase(),
            setName: scryfallCard.set_name,
            text: scryfallCard.oracle_text || '',
            flavor: scryfallCard.flavor_text,
            colors: scryfallCard.colors || [],
            cmc: scryfallCard.cmc,
            artist: scryfallCard.artist,
            legalities: scryfallCard.legalities,
            imageUrl: scryfallCard.image_uris?.normal,
            // Campos adicionais do Scryfall que podem ser úteis
            scryfall_id: scryfallCard.id,
            oracle_id: scryfallCard.oracle_id,
            released_at: scryfallCard.released_at,
            keywords: scryfallCard.keywords,
            color_identity: scryfallCard.color_identity,
        };
    }

    /**
     * Capitaliza o nome da raridade para compatibilidade
     */
    private capitalizeName(rarity: string): string {
        if (!rarity) return '';
        return rarity.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }

    /**
     * Busca de autocompletar para nomes de cartas
     */
    public async autocompleteCardNames(partialName: string, limit: number = 10): Promise<string[]> {
        try {
            // Usa a API de autocompletar do Scryfall
            const url = `${this.baseUrl}/cards/autocomplete?q=${encodeURIComponent(partialName)}`;
            const response = await axios.get<{ object: string; total_values: number; data: string[] }>(url);
            return response.data.data.slice(0, limit);
        } catch (error: any) {
            console.warn('Error in autocomplete:', error.message);
            return [];
        }
    }
}