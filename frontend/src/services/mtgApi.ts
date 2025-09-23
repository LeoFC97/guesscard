
export async function guessCard(cardName: string, gameId: string) {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/guess`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ guess: cardName, gameId }),
    });

    if (!response.ok) {
        throw new Error('Erro ao consultar a API');
    }

    return await response.json();
}