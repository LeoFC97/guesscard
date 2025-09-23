import React, { useState } from 'react';
import { Button, Typography, Box, CircularProgress, Alert } from '@mui/material';

export default function StartGame({ onGameStarted }: { onGameStarted: (cardName: string) => void }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleStart = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/new-game`, {
                method: 'POST',
            });
            if (!response.ok) throw new Error('Erro ao iniciar novo jogo');
            const data = await response.json();
            onGameStarted(data.cardName);
        } catch (err: any) {
            setError(err.message || 'Erro desconhecido');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box display="flex" flexDirection="column" alignItems="center" gap={2} mt={8}>
            <Typography variant="h4" gutterBottom>
                MTG Loldle
            </Typography>
            <Button variant="contained" color="primary" size="large" onClick={handleStart} disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Iniciar Novo Jogo'}
            </Button>
            {error && <Alert severity="error">{error}</Alert>}
        </Box>
    );
}
