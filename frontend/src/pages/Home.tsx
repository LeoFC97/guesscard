
import React, { useState } from 'react';
import { CardGuess } from '../components/CardGuess';
import GuessHistory from '../components/GuessHistory';
import StartGame from './StartGame';
import { Container, Typography } from '@mui/material';

export default function Home() {
    const [guesses, setGuesses] = useState<any[]>([]);
    const [gameStarted, setGameStarted] = useState(false);
    const [targetCard, setTargetCard] = useState<string | null>(null);

    const handleGuess = (result: any) => {
        setGuesses(prev => [result, ...prev]);
    };

    const handleGameStarted = (cardName: string) => {
        setGameStarted(true);
        setTargetCard(cardName);
        setGuesses([]);
    };

    if (!gameStarted) {
        return <StartGame onGameStarted={handleGameStarted} />;
    }

    return (
        <Container maxWidth="md" sx={{ py: 8 }}>
            <Typography variant="h3" align="center" color="primary" gutterBottom>
                MTG Loldle
            </Typography>
            <CardGuess onGuess={handleGuess} />
            <GuessHistory guesses={guesses} />
        </Container>
    );
}