
import React, { useState } from 'react';
import { Button, Alert, Tooltip } from '@mui/material';
import VictoryScreen from '../components/VictoryScreen';
import { CardGuess } from '../components/CardGuess';
import GuessHistory from '../components/GuessHistory';
import StartGame from './StartGame';
import { Container, Typography, Box, TextField } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const Home: React.FC = () => {
    React.useEffect(() => {
        console.log('API_URL:', process.env.REACT_APP_API_URL);
    }, []);
    const [guesses, setGuesses] = useState<any[]>([]);
    const [gameStarted, setGameStarted] = useState(false);
    const [targetCard, setTargetCard] = useState<string | null>(null);
    const [gameId, setGameId] = useState<string | null>(null);
    const [cardText, setCardText] = useState<string | null>(null);
    const [textReady, setTextReady] = useState<string | null>(null);
    const [flavorReady, setFlavorReady] = useState<string | null>(null);
    const [textShown, setTextShown] = useState(false);
    const [flavorShown, setFlavorShown] = useState(false);
    const [wrongCount, setWrongCount] = useState(0);
    const [victory, setVictory] = useState(false);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [endTime, setEndTime] = useState<number | null>(null);

    const handleGuess = (result: any) => {
        setGuesses(prev => [result, ...prev]);
        // Se vier text no feedback, armazene para dica
        if (result.feedback && typeof result.feedback.text === 'string') {
            setTextReady(result.feedback.text);
        }
        if (result.feedback && typeof result.feedback.flavor === 'string') {
            setFlavorReady(result.feedback.flavor);
        }
        // Conta erro se o palpite não for correto
        if (!result.isCorrect) {
            setWrongCount(prev => prev + 1);
        } else {
            // Se acertou, mostra tela de vitória
            setVictory(true);
            setEndTime(Date.now());
        }
    };

    const handleGameStarted = (cardName: string, gameId: string) => {
        setGameStarted(true);
        setTargetCard(cardName);
        setGameId(gameId);
        setGuesses([]);
        setTextReady(null);
        setTextShown(false);
        setWrongCount(0);
        setStartTime(Date.now());
        setEndTime(null);
    };

    // Detecta modo Carta do Dia
    const isDailyMode = gameId === 'daily';

    // Calendário para modo diário
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const date = e.target.value;
        setSelectedDate(new Date(date));
        // Chama backend para buscar carta do dia específico
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/daily-game?date=${date}`);
            const data = await response.json();
            setTargetCard(data.cardName);
            setGuesses([]);
            setTextReady(null);
            setTextShown(false);
            setWrongCount(0);
            setStartTime(Date.now());
            setEndTime(null);
        } catch {
            // erro: não faz nada
        }
    };

    if (!gameStarted) {
        return <StartGame onGameStarted={handleGameStarted} />;
    }
    if (victory) {
        const attempts = guesses.length;
        const timeSpent = startTime && endTime ? Math.round((endTime - startTime) / 1000) : 0;
        // Pega a carta alvo do último palpite correto
        const lastGuess = guesses.find(g => g.isCorrect) || guesses[0];
        const cardName = lastGuess?.guessedCard?.name || '-';
        const cardImage = lastGuess?.guessedCard?.imageUrl || '';
        return <VictoryScreen 
            onRestart={() => {
                setVictory(false);
                setGameStarted(false);
            }} 
            attempts={attempts}
            timeSpent={timeSpent}
            cardName={cardName}
            cardImage={cardImage}
        />;
    }

    const handleHint = () => {
        setTextShown(true);
        if (!textReady) setTextReady('Nenhum texto disponível para esta carta.');
    };

    const handleFlavorHint = () => {
        setFlavorShown(true);
        if (!flavorReady) setFlavorReady('Nenhum flavor disponível para esta carta.');
    };

    // Tela especial para modo Carta do Dia
    if (isDailyMode) {
        return (
            <Container maxWidth="md" sx={{ py: 8 }}>
                <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
                    <Typography variant="h3" align="center" color="secondary" gutterBottom>
                        Carta do Dia
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                        Você está jogando o modo especial: Carta do Dia
                    </Typography>
                    <Box mt={2} mb={2}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Escolha uma data:
                        </Typography>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                label="Data do desafio"
                                value={selectedDate}
                                onChange={(newValue: Date | null) => {
                                    if (newValue) {
                                        setSelectedDate(newValue);
                                        const dateStr = newValue.toISOString().slice(0, 10);
                                        handleDateChange({ target: { value: dateStr } } as any);
                                    }
                                }}
                                slotProps={{ textField: { fullWidth: true } }}
                            />
                        </LocalizationProvider>
                    </Box>
                </Box>
                <Box display="flex" gap={2} mb={2}>
                    <Tooltip
                        title={wrongCount < 2 ? 'A dica de flavor ficará disponível após 2 erros' : ''}
                        disableHoverListener={wrongCount >= 2}
                    >
                        <span>
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={handleFlavorHint}
                                disabled={flavorShown || wrongCount < 2}
                            >
                                Mostrar Dica (Flavor)
                            </Button>
                        </span>
                    </Tooltip>
                    <Tooltip
                        title={wrongCount < 5 ? 'A dica do efeito ficará disponível após 5 erros' : ''}
                        disableHoverListener={wrongCount >= 5}
                    >
                        <span>
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={handleHint}
                                disabled={textShown || wrongCount < 5}
                            >
                                Mostrar Dica (Efeito)
                            </Button>
                        </span>
                    </Tooltip>
                </Box>
                {flavorShown && flavorReady && (
                    <Alert severity="info" sx={{ mb: 2 }}>{flavorReady}</Alert>
                )}
                {textShown && textReady && (
                    <Alert severity="info" sx={{ mb: 2 }}>{textReady}</Alert>
                )}
                <CardGuess onGuess={handleGuess} gameId={gameId} />
                <GuessHistory guesses={guesses} />
            </Container>
        );
    }

    // ...tela normal...
    return null;
}

export default Home;