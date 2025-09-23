
import React, { useState } from 'react';
import { CardGuess } from '../components/CardGuess';
import GuessHistory from '../components/GuessHistory';
import { Container, Typography } from '@mui/material';

export default function Home() {
    const [guesses, setGuesses] = useState<any[]>([]);

    const handleGuess = (result: any) => {
        setGuesses(prev => [result, ...prev]);
    };

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