
import React, { useState } from 'react';
import { Button, Alert, Tooltip } from '@mui/material';
import { IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import VictoryScreen from '../components/VictoryScreen';
import { CardGuess } from '../components/CardGuess';
import GuessHistory from '../components/GuessHistory';
import StartGame from './StartGame';
import Leaderboards from '../components/Leaderboards';
import { Container, Typography, Box } from '@mui/material';
// Removido useUserInfo, centralizado no contexto Auth0

import { useAuth0 } from '@auth0/auth0-react';
// Novo fluxo: recebe dados do App via props
interface HomeProps {
    userId: string;
    name: string;
    email: string;
    themeMode: 'light' | 'dark';
    setThemeMode: React.Dispatch<React.SetStateAction<'light' | 'dark'>>;
}

const ThemeToggle: React.FC<{ themeMode: 'light' | 'dark'; setThemeMode: React.Dispatch<React.SetStateAction<'light' | 'dark'>> }> = ({ themeMode, setThemeMode }) => (
    <Tooltip title={themeMode === 'dark' ? 'Modo claro' : 'Modo escuro'}>
        <IconButton
            sx={{ position: 'fixed', top: 16, left: 24, zIndex: 2100 }}
            color="secondary"
            onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
        >
            {themeMode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
    </Tooltip>
);
const Home: React.FC<HomeProps> = ({ userId, name, email, themeMode, setThemeMode }) => {

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
    const [showLeaderboards, setShowLeaderboards] = useState(false);

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
            setWrongCount(0); // Só zera ao acertar
        }
        setTextReady(null);
        setTextShown(false);
        // Só reseta o tempo se não foi vitória
        if (!result.isCorrect) {
            setStartTime(Date.now());
            setEndTime(null);
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
    const isDailyMode = gameId === 'daily' || (gameId && gameId.startsWith('daily-'));



    // Se deve mostrar leaderboards
    if (showLeaderboards) {
        return (
            <Box position="relative">
                <ThemeToggle themeMode={themeMode} setThemeMode={setThemeMode} />
                <Container maxWidth="lg" sx={{ py: 4 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
                        <Typography variant="h4" component="h1" color="primary">
                            🏆 Leaderboards
                        </Typography>
                        <Button
                            variant="outlined"
                            onClick={() => setShowLeaderboards(false)}
                            sx={{ ml: 2 }}
                        >
                            Voltar ao Jogo
                        </Button>
                    </Box>
                    <Leaderboards />
                </Container>
            </Box>
        );
    }

    if (!gameStarted) {
        if (!userId) {
            return <Box display="flex" alignItems="center" justifyContent="center" minHeight={300}><ThemeToggle themeMode={themeMode} setThemeMode={setThemeMode} /><span>Carregando usuário...</span></Box>;
        }
    return (
        <Box position="relative">
            <ThemeToggle themeMode={themeMode} setThemeMode={setThemeMode} />
            <StartGame 
                onGameStarted={handleGameStarted} 
                userId={userId} 
                name={name} 
                email={email}
                onShowLeaderboards={() => setShowLeaderboards(true)}
            />
        </Box>
    );
    }
    if (victory) {
        const attempts = guesses.length;
        const timeSpent = startTime && endTime ? Math.round((endTime - startTime) / 1000) : 0;
        // Pega a carta alvo do último palpite correto
        const lastGuess = guesses.find(g => g.isCorrect) || guesses[0];
        const cardName = lastGuess?.guessedCard?.name || '-';
        const cardImage = lastGuess?.guessedCard?.imageUrl || '';
        return <Box position="relative"><ThemeToggle themeMode={themeMode} setThemeMode={setThemeMode} /><VictoryScreen 
                onRestart={() => {
                    setVictory(false);
                    setGameStarted(false);
                }} 
                attempts={attempts}
                timeSpent={timeSpent}
                cardName={cardName}
                cardImage={cardImage}
            /></Box>;
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
                    <Alert severity="info" sx={{ mb: 2, color: '#fff', background: themeMode === 'dark' ? '#23283a' : undefined }}>{flavorReady}</Alert>
                )}
                {textShown && textReady && (
                    <Alert severity="info" sx={{ mb: 2, color: '#fff', background: themeMode === 'dark' ? '#23283a' : undefined }}>{textReady}</Alert>
                )}
                <CardGuess
                    onGuess={handleGuess}
                    gameId={gameId}
                    userId={userId}
                    name={name}
                    email={email}
                    attempts={guesses.length + 1}
                    timeSpent={startTime ? Math.round(((endTime || Date.now()) - startTime) / 1000) : 0}
                />
                <GuessHistory guesses={guesses} themeMode={themeMode} />
                
                {/* Botões de ação */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4, mb: 2 }}>
                    <Button
                        variant="outlined"
                        color="success"
                        onClick={() => setShowLeaderboards(true)}
                        size="medium"
                        sx={{ 
                            px: 3,
                            py: 1,
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            borderRadius: 2
                        }}
                    >
                        🏆 Ver Rankings
                    </Button>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => {
                            setGameStarted(false);
                            setVictory(false);
                        }}
                        size="medium"
                        sx={{ 
                            px: 3,
                            py: 1,
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            borderRadius: 2
                        }}
                    >
                        🏠 Menu Inicial
                    </Button>
                </Box>
            </Container>
        );
    }

        // Tela normal de jogo (não diário)
        return (
            <Container maxWidth="md" sx={{ py: 8 }}>
                <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
                    <Typography variant="h3" align="center" color="primary" gutterBottom>
                        Adivinhe a carta!
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
                <CardGuess
                    onGuess={handleGuess}
                    gameId={gameId}
                    userId={userId}
                    name={name}
                    email={email}
                    attempts={guesses.length + 1}
                    timeSpent={startTime ? Math.round(((endTime || Date.now()) - startTime) / 1000) : 0}
                />
                <GuessHistory guesses={guesses} />
                
                {/* Botões de ação */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4, mb: 2 }}>
                    <Button
                        variant="outlined"
                        color="success"
                        onClick={() => setShowLeaderboards(true)}
                        size="medium"
                        sx={{ 
                            px: 3,
                            py: 1,
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            borderRadius: 2
                        }}
                    >
                        🏆 Ver Rankings
                    </Button>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => {
                            setGameStarted(false);
                            setVictory(false);
                        }}
                        size="medium"
                        sx={{ 
                            px: 3,
                            py: 1,
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            borderRadius: 2
                        }}
                    >
                        🏠 Menu Inicial
                    </Button>
                </Box>
            </Container>
        );
}

export default Home;