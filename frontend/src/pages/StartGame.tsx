import React, { useState } from 'react';
import { Button, Typography, Box, CircularProgress, Alert } from '@mui/material';

export default function StartGame({ onGameStarted }: { onGameStarted: (cardName: string, gameId: string) => void }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingDaily, setLoadingDaily] = useState(false);

    const handleStart = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/new-game`, {
                method: 'POST',
            });
            if (!response.ok) throw new Error('Erro ao iniciar novo jogo');
            const data = await response.json();
            onGameStarted(data.cardName, data.gameId);
        } catch (err: any) {
            setError(err.message || 'Erro desconhecido');
        } finally {
            setLoading(false);
        }
    };

    const handleStartDaily = async () => {
        setLoadingDaily(true);
        setError(null);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/daily-game`);
            if (!response.ok) throw new Error('Erro ao iniciar modo diário');
            const data = await response.json();
            // gameId pode ser null ou vazio, pois não é usado no modo diário
            onGameStarted(data.cardName, 'daily');
        } catch (err: any) {
            setError(err.message || 'Erro desconhecido');
        } finally {
            setLoadingDaily(false);
        }
    };

    const todayStr = new Date().toISOString().slice(0, 10);
    return (
        <Box display="flex" flexDirection="column" alignItems="center" gap={2} mt={8}>
            <Typography variant="h4" gutterBottom>
                Guess the card
            </Typography>
            <Button variant="contained" color="primary" size="large" onClick={handleStart} disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Iniciar Novo Jogo'}
            </Button>
            <Button variant="outlined" color="secondary" size="large" onClick={handleStartDaily} disabled={loadingDaily}>
                {loadingDaily ? <CircularProgress size={24} /> : `Carta do dia (${todayStr})`}
            </Button>
            {error && <Alert severity="error">{error}</Alert>}
        </Box>
    );
}
