
export async function guessCard(
    cardName: string,
    gameId: string,
    userId: string,
    name: string,
    email: string,
    attempts: number,
    timeSpent: number
) {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/guess`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            guess: cardName,
            gameId,
            userId,
            name,
            email,
            attempts,
            timeSpent,
        }),
    });
    if (!response.ok) {
        throw new Error('Erro ao consultar a API');
    }
    return await response.json();
}