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

export async function fetchUserProfile(userId: string, token: string | null) {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/user-stats/${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Erro ao buscar estatísticas do usuário');
    }

    return await response.json();
}

export async function requestHint(
    gameId: string,
    hintType: 'mana_cost' | 'card_type',
    userId: string
) {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/request-hint`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            gameId,
            hintType,
            userId,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao solicitar dica');
    }

    return await response.json();
}