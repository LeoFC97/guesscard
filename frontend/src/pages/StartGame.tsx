import React, { useState } from 'react';
import { Button, Typography, Box, CircularProgress, Alert, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import CheckIcon from '@mui/icons-material/Check';
import { useDailyPlayedDates } from '../hooks/useDailyPlayedDates';


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
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const playedDates = useDailyPlayedDates(userId);

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
    function getLocalDateStr(date?: Date) {
        const targetDate = date || new Date();
        const year = targetDate.getFullYear();
        const month = String(targetDate.getMonth() + 1).padStart(2, '0');
        const day = String(targetDate.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Função para renderizar dias customizados com check
    const renderCustomDay = (date: any, selectedDates: any, pickersDayProps: any) => {
        if (!date || typeof date.getFullYear !== 'function') {
            return <PickersDay {...pickersDayProps} />;
        }
        
        const dateStr = getLocalDateStr(date);
        const hasPlayed = playedDates.includes(dateStr);
        
        return (
            <Box position="relative" display="inline-block">
                <PickersDay {...pickersDayProps} />
                {hasPlayed && (
                    <Box
                        position="absolute"
                        top={-2}
                        right={-2}
                        sx={{
                            backgroundColor: '#00e676',
                            borderRadius: '50%',
                            width: 16,
                            height: 16,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1
                        }}
                    >
                        <CheckIcon sx={{ fontSize: 10, color: '#fff' }} />
                    </Box>
                )}
            </Box>
        );
    };



    const handleStartDaily = async () => {
        setLoadingDaily(true);
        setError(null);
        try {
            const selectedDateStr = getLocalDateStr(selectedDate);
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/daily-game?userId=${encodeURIComponent(userId)}&date=${selectedDateStr}`);
            const data = await response.json();
            
            if (!response.ok) {
                if (response.status === 403) {
                    setError(`Você já jogou a carta do dia ${selectedDateStr}. Escolha uma data diferente.`);
                } else if (response.status === 404) {
                    setError(`Nenhuma carta foi definida para o dia ${selectedDateStr}.`);
                } else {
                    setError(data.message || 'Erro ao iniciar modo diário');
                }
                return;
            }
            
            // Usa o gameId retornado pelo backend que inclui a data (daily-YYYY-MM-DD)
            const gameId = data.gameId || 'daily';
            onGameStarted(data.cardName, gameId);
        } catch (err: any) {
            setError('Erro de conexão. Verifique sua internet e tente novamente.');
        } finally {
            setLoadingDaily(false);
        }
    };

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
            
            <Box sx={{ mt: 3, mb: 2, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'text.primary' }}>
                    Modo Carta do Dia
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Escolha uma data para jogar:
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                        label="Data do desafio"
                        value={selectedDate}
                        onChange={(newValue: Date | null) => {
                            if (newValue) {
                                setSelectedDate(newValue);
                            }
                        }}
                        slots={{
                            day: (dayProps: any) => renderCustomDay(dayProps.day, [], dayProps)
                        }}
                        slotProps={{ 
                            textField: { 
                                fullWidth: false,
                                sx: { maxWidth: 250, mb: 2 }
                            }
                        }}
                    />
                </LocalizationProvider>
            </Box>
            
            <Button variant="outlined" color="secondary" size="large" onClick={handleStartDaily} disabled={loadingDaily}>
                {loadingDaily ? <CircularProgress size={24} /> : `Jogar carta do dia (${getLocalDateStr(selectedDate)})`}
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
