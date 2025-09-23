
import React, { useState } from 'react';
import { Button, Alert, Tooltip } from '@mui/material';
import VictoryScreen from '../components/VictoryScreen';
import { CardGuess } from '../components/CardGuess';
import GuessHistory from '../components/GuessHistory';
import StartGame from './StartGame';
import { Container, Typography, Box } from '@mui/material';

const Home: React.FC = () => {
    React.useEffect(() => {
        console.log('API_URL:', process.env.REACT_APP_API_URL);
    }, []);
    const [guesses, setGuesses] = useState<any[]>([]);
    const [gameStarted, setGameStarted] = useState(false);
    const [targetCard, setTargetCard] = useState<string | null>(null);
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

    const handleGameStarted = (cardName: string) => {
        setGameStarted(true);
        setTargetCard(cardName);
        setGuesses([]);
        setTextReady(null);
        setTextShown(false);
        setWrongCount(0);
        setStartTime(Date.now());
        setEndTime(null);
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

    return (
        <Container maxWidth="md" sx={{ py: 8 }}>
            <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
                <img src="https://gatherer.wizards.com/Handlers/Image.ashx?type=cardback" alt="MTG Card Back" style={{ width: 120, marginBottom: 12 }} />
                <Typography variant="h3" align="center" color="primary" gutterBottom>
                    Guess de Card
                </Typography>
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
            <CardGuess onGuess={handleGuess} />
            <GuessHistory guesses={guesses} />
        </Container>
    );
};

export default Home;