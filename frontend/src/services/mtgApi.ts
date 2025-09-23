const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

export async function guessCard(cardName: string) {
    const response = await fetch(`${BACKEND_URL}/api/guess`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ guess: cardName }),
    });

    if (!response.ok) {
        throw new Error('Erro ao consultar a API');
    }

    return await response.json();
}