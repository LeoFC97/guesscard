import React, { useState } from 'react';
import { Button, Typography, Box, CircularProgress, Alert, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import CheckIcon from '@mui/icons-material/Check';
import { useDailyPlayedDates } from '../hooks/useDailyPlayedDates';
import { useLocale } from '../contexts/LocaleContext';
import { t } from '../utils/translate';


type StartGameProps = {
    onGameStarted: (cardName: string, gameId: string, gameData?: any) => void;
    userId: string;
    name: string;
    email: string;
    onShowLeaderboards?: () => void;
};

const StartGame: React.FC<StartGameProps> = ({ onGameStarted, userId, name, email, onShowLeaderboards }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingDaily, setLoadingDaily] = useState(false);
    const [loadingBlur, setLoadingBlur] = useState(false);
    const [loadingText, setLoadingText] = useState(false);
    const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const playedDates = useDailyPlayedDates(userId);
    const { locale } = useLocale();

    const handleStart = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/new-game`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ difficulty }),
            });
            if (!response.ok) throw new Error(t('errors.newGame', locale));
            const data = await response.json();
            onGameStarted(data.cardName, data.gameId);
        } catch (err: any) {
            setError(err.message || t('login.unknownError', locale));
        } finally {
            setLoading(false);
        }
    };

    const handleStartBlur = async () => {
        setLoadingBlur(true);
        setError(null);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/new-blur-game`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ difficulty }),
            });
            if (!response.ok) throw new Error(t('errors.newBlurGame', locale));
            const data = await response.json();
            onGameStarted(data.cardName, data.gameId, data);
        } catch (err: any) {
            setError(err.message || t('login.unknownError', locale));
        } finally {
            setLoadingBlur(false);
        }
    };

    const handleStartText = async () => {
        setLoadingText(true);
        setError(null);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/new-text-game`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ difficulty }),
            });
            if (!response.ok) throw new Error(t('errors.newTextGame', locale));
            const data = await response.json();
            onGameStarted(data.cardName, data.gameId, data);
        } catch (err: any) {
            setError(err.message || t('login.unknownError', locale));
        } finally {
            setLoadingText(false);
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



    // Função para verificar se a data é futura
    const isDateInFuture = (date: Date) => {
        const today = new Date();
        today.setHours(23, 59, 59, 999); // Fim do dia atual
        return date > today;
    };

    const handleStartDaily = async () => {
        // Validação no frontend para datas futuras
        if (isDateInFuture(selectedDate)) {
            setError(t('errors.futureDate', locale));
            return;
        }

        setLoadingDaily(true);
        setError(null);
        try {
            const selectedDateStr = getLocalDateStr(selectedDate);
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/daily-game?userId=${encodeURIComponent(userId)}&date=${selectedDateStr}`);
            const data = await response.json();
            
            if (!response.ok) {
                if (response.status === 403) {
                    setError(t('errors.dailyAlreadyPlayed', locale).replace('{{date}}', selectedDateStr));
                } else if (response.status === 404) {
                    setError(t('errors.dailyNotDefined', locale).replace('{{date}}', selectedDateStr));
                } else {
                    setError(data.message || t('errors.dailyStartError', locale));
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
        <Box 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            gap={{ xs: 1.5, sm: 2 }} 
            mt={{ xs: 4, sm: 6, md: 8 }}
            px={{ xs: 2, sm: 3 }}
            maxWidth="100%"
        >
            <Typography 
                variant="h4" 
                gutterBottom
                sx={{
                    fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' },
                    textAlign: 'center'
                }}
            >
                {t('start.title', locale)}
            </Typography>
            <ToggleButtonGroup
                value={difficulty}
                exclusive
                onChange={(_, value) => value && setDifficulty(value)}
                sx={{ 
                    mb: 2,
                    flexDirection: { xs: 'column', sm: 'row' },
                    width: { xs: '100%', sm: 'auto' },
                    '& .MuiToggleButton-root': {
                        fontSize: { xs: '0.8rem', sm: '0.875rem' },
                        px: { xs: 2, sm: 3 },
                        py: { xs: 1, sm: 1.5 }
                    }
                }}
            >
                <ToggleButton value="easy">{t('start.difficulty.easy', locale)}</ToggleButton>
                <ToggleButton value="medium">{t('start.difficulty.medium', locale)}</ToggleButton>
                <ToggleButton value="hard">{t('start.difficulty.hard', locale)}</ToggleButton>
            </ToggleButtonGroup>
            <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                    mb: 1, 
                    fontWeight: 500,
                    textAlign: 'center',
                    px: { xs: 1, sm: 0 },
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }}
            >
                <span style={{ color: '#9c27b0', fontWeight: 700 }}>
                    {t('start.difficultyNote', locale)}
                </span>
            </Typography>
            <Button 
                variant="contained" 
                color="primary" 
                size="large" 
                onClick={handleStart} 
                disabled={loading}
                sx={{
                    width: { xs: '100%', sm: 'auto' },
                    minWidth: { xs: 'auto', sm: 200 },
                    py: { xs: 1.5, sm: 2 },
                    fontSize: { xs: '0.9rem', sm: '1rem' }
                }}
            >
                {loading ? <CircularProgress size={24} /> : t('start.startNewGame', locale)}
            </Button>

            {/* Modo Texto */}
            <Box sx={{ 
                mt: { xs: 3, sm: 2 }, 
                mb: 2, 
                textAlign: 'center',
                px: { xs: 1, sm: 0 },
                maxWidth: { xs: '100%', sm: 500 }
            }}>
                <Typography 
                    variant="h6" 
                    gutterBottom 
                    sx={{ 
                        color: 'warning.main',
                        fontSize: { xs: '1.1rem', sm: '1.25rem' }
                    }}
                >
                    {t('start.textMode.title', locale)}
                </Typography>
                <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    gutterBottom 
                    sx={{ 
                        mb: 2,
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        lineHeight: 1.4
                    }}
                >
                    {t('start.textMode.description', locale)}
                    <br />
                    <span style={{ color: '#ed6c02', fontWeight: 700 }}>
                        Desafio para conhecedores das mecânicas de MTG!
                    </span>
                </Typography>
                <Button 
                    variant="contained" 
                    color="warning" 
                    size="large" 
                    onClick={handleStartText} 
                    disabled={loadingText}
                    sx={{
                        background: 'linear-gradient(45deg, #ed6c02 30%, #ff9800 90%)',
                        boxShadow: '0 3px 5px 2px rgba(237, 108, 2, .3)',
                        width: { xs: '100%', sm: 'auto' },
                        minWidth: { xs: 'auto', sm: 200 },
                        py: { xs: 1.5, sm: 2 },
                        fontSize: { xs: '0.9rem', sm: '1rem' }
                    }}
                >
                    {loadingText ? <CircularProgress size={24} /> : t('start.textMode.play', locale)}
                </Button>
            </Box>

            {/* Modo Blur */}
            <Box sx={{ 
                mt: 2, 
                mb: 2, 
                textAlign: 'center',
                px: { xs: 1, sm: 0 },
                maxWidth: { xs: '100%', sm: 500 }
            }}>
                <Typography 
                    variant="h6" 
                    gutterBottom 
                    sx={{ 
                        color: 'secondary.main',
                        fontSize: { xs: '1.1rem', sm: '1.25rem' }
                    }}
                >
                    {t('start.blurMode.title', locale)}
                </Typography>
                <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    gutterBottom 
                    sx={{ 
                        mb: 2,
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        lineHeight: 1.4
                    }}
                >
                    {t('start.blurMode.description', locale)}
                    <br />
                    <span style={{ color: '#9c27b0', fontWeight: 700 }}>
                        Sem limite de tentativas - o blur reduz 10% a cada palpite.
                    </span>
                </Typography>
                <Button 
                    variant="contained" 
                    color="secondary" 
                    size="large" 
                    onClick={handleStartBlur} 
                    disabled={loadingBlur}
                    sx={{
                        background: 'linear-gradient(45deg, #9c27b0 30%, #673ab7 90%)',
                        boxShadow: '0 3px 5px 2px rgba(156, 39, 176, .3)',
                        width: { xs: '100%', sm: 'auto' },
                        minWidth: { xs: 'auto', sm: 200 },
                        py: { xs: 1.5, sm: 2 },
                        fontSize: { xs: '0.9rem', sm: '1rem' }
                    }}
                >
                    {loadingBlur ? <CircularProgress size={24} /> : t('start.blurMode.play', locale)}
                </Button>
            </Box>
            
            <Box sx={{ 
                mt: { xs: 3, sm: 3 }, 
                mb: 2, 
                textAlign: 'center',
                px: { xs: 1, sm: 0 },
                maxWidth: { xs: '100%', sm: 400 }
            }}>
                <Typography 
                    variant="h6" 
                    gutterBottom 
                    sx={{ 
                        color: 'text.primary',
                        fontSize: { xs: '1.1rem', sm: '1.25rem' }
                    }}
                >
                    {t('start.dailyMode.title', locale)}
                </Typography>
                <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    gutterBottom
                    sx={{
                        fontSize: { xs: '0.8rem', sm: '0.875rem' }
                    }}
                >
                    {t('start.dailyMode.chooseDate', locale)}
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                        label={t('start.dailyMode.dateLabel', locale)}
                        value={selectedDate}
                        onChange={(newValue: Date | null) => {
                            if (newValue) {
                                setSelectedDate(newValue);
                                // Limpar erro quando selecionar uma data válida
                                if (!isDateInFuture(newValue)) {
                                    setError(null);
                                }
                            }
                        }}
                        maxDate={new Date()} // Não permite seleção de datas futuras
                        slots={{
                            day: (dayProps: any) => renderCustomDay(dayProps.day, [], dayProps)
                        }}
                        slotProps={{ 
                            textField: { 
                                fullWidth: false,
                                sx: { 
                                    maxWidth: { xs: '100%', sm: 250 }, 
                                    width: { xs: '100%', sm: 'auto' },
                                    mb: 2 
                                },
                                error: isDateInFuture(selectedDate),
                                helperText: isDateInFuture(selectedDate) ? t('start.dailyMode.futureDateHelper', locale) : ''
                            }
                        }}
                    />
                </LocalizationProvider>
            </Box>
            
            <Button 
                variant="outlined" 
                color="secondary" 
                size="large" 
                onClick={handleStartDaily} 
                disabled={loadingDaily || isDateInFuture(selectedDate)}
                sx={{ 
                    opacity: isDateInFuture(selectedDate) ? 0.5 : 1,
                    cursor: isDateInFuture(selectedDate) ? 'not-allowed' : 'pointer',
                    width: { xs: '100%', sm: 'auto' },
                    minWidth: { xs: 'auto', sm: 300 },
                    py: { xs: 1.5, sm: 2 },
                    fontSize: { xs: '0.85rem', sm: '1rem' },
                    px: { xs: 2, sm: 3 }
                }}
            >
                 {loadingDaily ? <CircularProgress size={24} /> : 
                  t('start.dailyMode.playWithDate', locale).replace('{{date}}', getLocalDateStr(selectedDate))}
            </Button>

            {/* Botão de Leaderboards */}
            {onShowLeaderboards && (
                <Box sx={{ 
                    mt: { xs: 3, sm: 4 },
                    px: { xs: 1, sm: 0 }
                }}>
                        <Button
                        variant="contained"
                        color="success"
                        size="large"
                        onClick={onShowLeaderboards}
                        sx={{ 
                            px: { xs: 3, sm: 4 },
                            py: { xs: 1.2, sm: 1.5 },
                            fontSize: { xs: '0.95rem', sm: '1.1rem' },
                            fontWeight: 600,
                            borderRadius: 3,
                            boxShadow: 3,
                            width: { xs: '100%', sm: 'auto' },
                            minWidth: { xs: 'auto', sm: 180 }
                        }}
                    >
                        {t('home.viewRankings', locale)}
                    </Button>
                </Box>
            )}

            {error && (
                <Box
                    sx={{
                        mt: 2,
                        mb: 1,
                        px: { xs: 2, sm: 3 },
                        py: { xs: 1.5, sm: 2 },
                        borderRadius: 2,
                        background: 'linear-gradient(90deg, #ff5252 0%, #ffb300 100%)',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: { xs: '0.9rem', sm: '1.1rem' },
                        boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
                        textAlign: 'center',
                        maxWidth: { xs: '100%', sm: 420 },
                        letterSpacing: 0.2,
                        border: '2px solid #fff3e0',
                        animation: 'shake 0.4s',
                        mx: { xs: 1, sm: 0 }
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
