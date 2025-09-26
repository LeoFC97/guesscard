import React, { useState } from 'react';
import { Button, Typography, Box, CircularProgress, Alert, ToggleButton, ToggleButtonGroup } from '@mui/material';


type StartGameProps = {
    onGameStarted: (cardName: string, gameId: string) => void;
    userId: string;
    name: string;
    email: string;
};

const StartGame: React.FC<StartGameProps> = ({ onGameStarted, userId, name, email }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingDaily, setLoadingDaily] = useState(false);
    const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

    const handleStart = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/new-game`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ difficulty }),
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

    // Função para obter a data local do usuário no formato yyyy-mm-dd
    function getLocalDateStr() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    const handleStartDaily = async () => {
        setLoadingDaily(true);
        setError(null);
        try {
            const todayStr = getLocalDateStr();
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/daily-game?userId=${encodeURIComponent(userId)}&date=${todayStr}`);
            const data = await response.json();
            if (!response.ok) {
                setError(data.message || 'Erro ao iniciar modo diário');
                return;
            }
            // gameId pode ser null ou vazio, pois não é usado no modo diário
            onGameStarted(data.cardName, 'daily');
        } catch (err: any) {
            setError(err.message || 'Erro desconhecido');
        } finally {
            setLoadingDaily(false);
        }
    };

    const todayStr = getLocalDateStr();
    return (
        <Box display="flex" flexDirection="column" alignItems="center" gap={2} mt={8}>
            <Typography variant="h4" gutterBottom>
                Guess the card
            </Typography>
            <ToggleButtonGroup
                value={difficulty}
                exclusive
                onChange={(_, value) => value && setDifficulty(value)}
                sx={{ mb: 2 }}
            >
                <ToggleButton value="easy">Fácil</ToggleButton>
                <ToggleButton value="medium">Intermediário</ToggleButton>
                <ToggleButton value="hard">Difícil</ToggleButton>
            </ToggleButtonGroup>
            <Button variant="contained" color="primary" size="large" onClick={handleStart} disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Iniciar Novo Jogo'}
            </Button>
            <Button variant="outlined" color="secondary" size="large" onClick={handleStartDaily} disabled={loadingDaily}>
                {loadingDaily ? <CircularProgress size={24} /> : `Carta do dia (${todayStr})`}
            </Button>
            {error && (
                <Box
                    sx={{
                        mt: 2,
                        mb: 1,
                        px: 3,
                        py: 2,
                        borderRadius: 2,
                        background: 'linear-gradient(90deg, #ff5252 0%, #ffb300 100%)',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: '1.1rem',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
                        textAlign: 'center',
                        maxWidth: 420,
                        letterSpacing: 0.2,
                        border: '2px solid #fff3e0',
                        animation: 'shake 0.4s',
                    }}
                >
                    <span style={{ fontSize: 22, marginRight: 8 }}>⚠️</span>
                    {error}
                    <style>
                        {`
                        @keyframes shake {
                            0% { transform: translateX(0); }
                            20% { transform: translateX(-8px); }
                            40% { transform: translateX(8px); }
                            60% { transform: translateX(-6px); }
                            80% { transform: translateX(6px); }
                            100% { transform: translateX(0); }
                        }
                        `}
                    </style>
                </Box>
            )}
        </Box>
    );
};

export default StartGame;
