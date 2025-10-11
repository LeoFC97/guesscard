
import React, { useState } from 'react';
import { Button, Alert, Tooltip } from '@mui/material';
import { IconButton } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import VictoryScreen from '../components/VictoryScreen';
import { CardGuess } from '../components/CardGuess';
import GuessHistory from '../components/GuessHistory';
import StartGame from './StartGame';
import Leaderboards from '../components/Leaderboards';
import { useCoins } from '../contexts/CoinsContext';
import BlurredCard from '../components/BlurredCard';
import TextCard from '../components/TextCard';
import AdButton from '../components/AdButton';
import AdBanner from '../components/AdBanner';
import InterstitialAd from '../components/InterstitialAd';
import { getAdUnitId } from '../config/adConfig';
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
    const { animateCoinsGain, refreshBalance } = useCoins();

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
    const [showInterstitialAd, setShowInterstitialAd] = useState(false);
    const [showLeaderboards, setShowLeaderboards] = useState(false);
    const [isBlurMode, setIsBlurMode] = useState(false);
    const [isTextMode, setIsTextMode] = useState(false);
    const [textManaCostShown, setTextManaCostShown] = useState(false);
    const [textCardTypeShown, setTextCardTypeShown] = useState(false);
    const [cardImageUrl, setCardImageUrl] = useState<string | null>(null);
    const [cardTextData, setCardTextData] = useState<{text: string, type: string, manaCost: number, hasCensoredContent?: boolean} | null>(null);
    const [maxBlurAttempts, setMaxBlurAttempts] = useState(-1); // Sem limite
    const [currentBlurLevel, setCurrentBlurLevel] = useState<number>(5); // Começa com 5px

    const handleGuess = (result: any) => {
        setGuesses(prev => [result, ...prev]);
        // Se vier text no feedback, armazene para dica
        if (result.feedback && typeof result.feedback.text === 'string') {
            setTextReady(result.feedback.text);
        }
        if (result.feedback && typeof result.feedback.flavor === 'string') {
            setFlavorReady(result.feedback.flavor);
        }
        
        // Atualizar informações específicas do modo blur
        if (result.feedback && result.feedback.blurInfo) {
            setCurrentBlurLevel(result.feedback.blurInfo.blurLevel || 0);
        }
        
        // Conta erro se o palpite não for correto
        if (!result.isCorrect) {
            setWrongCount(prev => prev + 1);
        } else {
            // Se acertou, mostra tela de vitória
            setVictory(true);
            setEndTime(Date.now());
            setWrongCount(0); // Só zera ao acertar
            
            // Processar recompensa de moedas se houver
            if (result.coinReward && userId && userId !== 'guest') {
                console.log('🪙 Moedas ganhas:', result.coinReward);
                animateCoinsGain(result.coinReward);
            }

            // Mostrar anúncio intersticial ocasionalmente (30% de chance)
            if (Math.random() < 0.3 && userId && userId !== 'guest') {
                setTimeout(() => {
                    setShowInterstitialAd(true);
                }, 2000); // Aguardar 2 segundos após a vitória
            }
        }
        setTextReady(null);
        setTextShown(false);
        // Só reseta o tempo se não foi vitória
        if (!result.isCorrect) {
            setStartTime(Date.now());
            setEndTime(null);
        }
    };

    const handleGameStarted = (cardName: string, gameId: string, gameData?: any) => {
        setGameStarted(true);
        setTargetCard(cardName);
        setGameId(gameId);
        setGuesses([]);
        setTextReady(null);
        setTextShown(false);
        setFlavorReady(null);
        setFlavorShown(false);
        setWrongCount(0);
        setStartTime(Date.now());
        setEndTime(null);
        // Resetar estados das dicas do modo texto
        setTextManaCostShown(false);
        setTextCardTypeShown(false);
        
        // Detectar modo blur
        const blurMode = gameId.startsWith('blur-') || gameData?.gameMode === 'blur';
        setIsBlurMode(blurMode);
        
        // Detectar modo texto
        const textMode = gameId.startsWith('text-') || gameData?.gameMode === 'text';
        setIsTextMode(textMode);
        
        if (blurMode && gameData) {
            setCardImageUrl(gameData.cardImage || null);
            setMaxBlurAttempts(gameData.maxBlurAttempts || -1);
            setCurrentBlurLevel(gameData.initialBlur || 5); // Reinicia com blur inicial mais fraco
            setCardTextData(null);
        } else if (textMode && gameData) {
            setCardImageUrl(gameData.cardImage || null);
            setCardTextData({
                text: gameData.cardText || '',
                type: gameData.cardType || '',
                manaCost: gameData.manaCost || 0,
                hasCensoredContent: gameData.hasCensoredContent || false
            });
            setMaxBlurAttempts(-1);
            setCurrentBlurLevel(5);
        } else {
            setCardImageUrl(null);
            setCardTextData(null);
            setIsBlurMode(false);
            setIsTextMode(false);
            setCurrentBlurLevel(5);
        }
    };

    // Detecta modo Carta do Dia
    const isDailyMode = gameId === 'daily' || (gameId && gameId.startsWith('daily-'));

    // Callback para quando uma dica é comprada
    const handleHintPurchased = () => {
        // Recarregar as dicas do backend ou atualizar estados conforme necessário
        // Por enquanto, as dicas são reveladas via resposta da API
        setTextManaCostShown(true);
        setTextCardTypeShown(true);
    };



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
        <Box 
            position="relative" 
            sx={{ 
                padding: { xs: 1, sm: 2 },
                minHeight: '100vh',
                maxWidth: '100vw',
                overflow: 'hidden'
            }}
        >
            <ThemeToggle themeMode={themeMode} setThemeMode={setThemeMode} />
            
            {/* Banner de Anúncio Superior - Só mostrar em telas médias e grandes */}
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <AdBanner 
                    adSlot={getAdUnitId('BANNER_TOP')}
                    adFormat="horizontal"
                    adSize="728x90"
                    style={{ marginBottom: 16 }}
                />
            </Box>
            
            <StartGame 
                onGameStarted={handleGameStarted} 
                userId={userId} 
                name={name} 
                email={email}
                onShowLeaderboards={() => setShowLeaderboards(true)}
            />
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                mt: { xs: 2, sm: 3 },
                px: { xs: 1, sm: 0 }
            }}>
                <AdButton userId={userId} themeMode={themeMode} variant="button" />
            </Box>
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
                <Box 
                    display="flex" 
                    gap={{ xs: 1, sm: 2 }} 
                    mb={{ xs: 2, sm: 3 }}
                    flexDirection={{ xs: 'column', sm: 'row' }}
                    alignItems="stretch"
                    justifyContent="center"
                    px={{ xs: 1, sm: 0 }}
                >
                    <Tooltip
                        title={wrongCount < 2 ? 'A dica de flavor ficará disponível após 2 erros' : ''}
                        disableHoverListener={wrongCount >= 2}
                    >
                        <span style={{ width: '100%' }}>
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={handleFlavorHint}
                                disabled={flavorShown || wrongCount < 2}
                                sx={{
                                    width: { xs: '100%', sm: 'auto' },
                                    minWidth: { xs: 'auto', sm: 160 },
                                    py: { xs: 1.2, sm: 1 },
                                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                                    fontWeight: 600
                                }}
                            >
                                Mostrar Dica (Flavor)
                            </Button>
                        </span>
                    </Tooltip>
                    <Tooltip
                        title={wrongCount < 5 ? 'A dica do efeito ficará disponível após 5 erros' : ''}
                        disableHoverListener={wrongCount >= 5}
                    >
                        <span style={{ width: '100%' }}>
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={handleHint}
                                disabled={textShown || wrongCount < 5}
                                sx={{
                                    width: { xs: '100%', sm: 'auto' },
                                    minWidth: { xs: 'auto', sm: 160 },
                                    py: { xs: 1.2, sm: 1 },
                                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                                    fontWeight: 600
                                }}
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
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    gap: { xs: 1, sm: 2 }, 
                    mt: { xs: 3, sm: 4 }, 
                    mb: 2, 
                    flexWrap: 'wrap',
                    px: { xs: 1, sm: 0 }
                }}>
                    <Button
                        variant="outlined"
                        color="success"
                        onClick={() => setShowLeaderboards(true)}
                        size="medium"
                        sx={{ 
                            px: { xs: 2, sm: 3 },
                            py: { xs: 0.8, sm: 1 },
                            fontSize: { xs: '0.8rem', sm: '0.9rem' },
                            fontWeight: 600,
                            borderRadius: 2,
                            minWidth: { xs: 'auto', sm: 140 }
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
                            px: { xs: 2, sm: 3 },
                            py: { xs: 0.8, sm: 1 },
                            fontSize: { xs: '0.8rem', sm: '0.9rem' },
                            fontWeight: 600,
                            borderRadius: 2,
                            minWidth: { xs: 'auto', sm: 140 }
                        }}
                    >
                        🏠 Menu Inicial
                    </Button>
                    <AdButton userId={userId} themeMode={themeMode} variant="compact" />
                </Box>
            </Container>
        );
    }

    // Tela especial para modo Texto
    if (isTextMode) {
        return (
            <Container maxWidth="lg" sx={{ py: 8 }}>
                {/* Banner de Anúncio Superior - Modo Texto */}
                <AdBanner 
                    adSlot={getAdUnitId('BANNER_TEXT_MODE')}
                    adFormat="rectangle"
                    adSize="300x250"
                    style={{ marginBottom: 24 }}
                />
                
                <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
                    <Typography variant="h3" align="center" sx={{ 
                        background: 'linear-gradient(45deg, #ed6c02 30%, #ff9800 90%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }} gutterBottom>
                        📜 Modo Texto
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                        Adivinhe a carta pelo texto e habilidades! Nome censurado.
                    </Typography>
                </Box>

                {/* Componente da carta com texto */}
                {cardTextData && (
                    <TextCard
                        cardText={cardTextData.text}
                        cardType={cardTextData.type}
                        manaCost={cardTextData.manaCost}
                        cardName={targetCard || undefined}
                        showCard={victory}
                        hasCensoredContent={cardTextData.hasCensoredContent}
                        gameId={gameId || undefined}
                        userId={userId}
                        showManaCost={textManaCostShown}
                        showCardType={textCardTypeShown}
                        onHintPurchased={handleHintPurchased}
                    />
                )}

                <CardGuess
                    onGuess={handleGuess}
                    gameId={gameId}
                    userId={userId}
                    name={name}
                    email={email}
                    attempts={wrongCount + 1}
                    timeSpent={endTime && startTime ? Math.floor((endTime - startTime) / 1000) : 0}
                />

                {victory && <VictoryScreen
                    cardName={targetCard || ''}
                    attempts={wrongCount + 1}
                    timeSpent={endTime && startTime ? Math.floor((endTime - startTime) / 1000) : 0}
                    onRestart={() => setGameStarted(false)}
                    cardImage={cardImageUrl || ''}
                />}

                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Button
                        variant="outlined"
                        onClick={() => setGameStarted(false)}
                        sx={{ mr: 2 }}
                    >
                        Voltar ao Menu
                    </Button>
                </Box>
            </Container>
        );
    }

    // Tela especial para modo Blur
    if (isBlurMode) {
        return (
            <Container maxWidth="md" sx={{ py: 8 }}>
                <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
                    <Typography variant="h3" align="center" sx={{ 
                        background: 'linear-gradient(45deg, #9c27b0 30%, #673ab7 90%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }} gutterBottom>
                        🔍 Modo Blur
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                        A carta vai ficando mais nítida a cada palpite! (Reduz 10% do blur por erro)
                    </Typography>
                </Box>

                {/* Componente da carta borrada */}
                {cardImageUrl && (
                    <BlurredCard
                        imageUrl={cardImageUrl}
                        attempts={wrongCount}
                        maxAttempts={maxBlurAttempts}
                        cardName={targetCard || undefined}
                        showCard={victory}
                        blurLevel={currentBlurLevel}
                    />
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
            <Container 
                maxWidth="lg" 
                sx={{ 
                    py: { xs: 2, sm: 4, md: 8 },
                    px: { xs: 1, sm: 2, md: 3 },
                    minHeight: '100vh'
                }}
            >
                {/* Layout com Sidebar para Anúncios */}
                <Box sx={{ 
                    display: 'flex', 
                    gap: { xs: 1, sm: 2, md: 3 }, 
                    flexDirection: { xs: 'column', lg: 'row' } 
                }}>
                    
                    {/* Sidebar Esquerda - Anúncios - Só mostrar em telas grandes */}
                    <Box sx={{ 
                        width: { lg: '200px' },
                        display: { xs: 'none', lg: 'block' },
                        flexShrink: 0
                    }}>
                        <AdBanner 
                            adSlot={getAdUnitId('SIDEBAR_LEFT')}
                            adFormat="vertical"
                            adSize="160x600"
                        />
                    </Box>
                    
                    {/* Conteúdo Principal */}
                    <Box sx={{ 
                        flex: 1, 
                        maxWidth: { xs: '100%', lg: 'calc(100% - 416px)' },
                        overflow: 'hidden'
                    }}>
                <Box display="flex" flexDirection="column" alignItems="center" mb={{ xs: 2, sm: 3, md: 4 }}>
                    <Typography 
                        variant="h3"
                        align="center" 
                        color="primary" 
                        gutterBottom
                        sx={{ 
                            fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.125rem', lg: '3rem' },
                            px: { xs: 1, sm: 0 }
                        }}
                    >
                        Adivinhe a carta!
                    </Typography>
                </Box>
                <Box 
                    display="flex" 
                    gap={{ xs: 1, sm: 2 }} 
                    mb={{ xs: 2, sm: 3 }}
                    flexDirection={{ xs: 'column', sm: 'row' }}
                    alignItems="stretch"
                    justifyContent="center"
                    px={{ xs: 1, sm: 0 }}
                >
                    <Tooltip
                        title={wrongCount < 2 ? 'A dica de flavor ficará disponível após 2 erros' : ''}
                        disableHoverListener={wrongCount >= 2}
                    >
                        <span style={{ width: '100%' }}>
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={handleFlavorHint}
                                disabled={flavorShown || wrongCount < 2}
                                sx={{
                                    width: { xs: '100%', sm: 'auto' },
                                    minWidth: { xs: 'auto', sm: 160 },
                                    py: { xs: 1.2, sm: 1 },
                                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                                    fontWeight: 600
                                }}
                            >
                                Mostrar Dica (Flavor)
                            </Button>
                        </span>
                    </Tooltip>
                    <Tooltip
                        title={wrongCount < 5 ? 'A dica do efeito ficará disponível após 5 erros' : ''}
                        disableHoverListener={wrongCount >= 5}
                    >
                        <span style={{ width: '100%' }}>
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={handleHint}
                                disabled={textShown || wrongCount < 5}
                                sx={{
                                    width: { xs: '100%', sm: 'auto' },
                                    minWidth: { xs: 'auto', sm: 160 },
                                    py: { xs: 1.2, sm: 1 },
                                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                                    fontWeight: 600
                                }}
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
                    
                    </Box> {/* Fim do Conteúdo Principal */}
                    
                    {/* Sidebar Direita - Anúncios - Só mostrar em telas grandes */}
                    <Box sx={{ 
                        width: { lg: '200px' },
                        display: { xs: 'none', lg: 'block' },
                        flexShrink: 0
                    }}>
                        <AdBanner 
                            adSlot={getAdUnitId('SIDEBAR_RIGHT')}
                            adFormat="vertical"
                            adSize="160x600"
                        />
                    </Box>
                    
                </Box> {/* Fim do Layout com Sidebar */}
                
                {/* Anúncio Intersticial */}
                <InterstitialAd
                    isOpen={showInterstitialAd}
                    onClose={() => setShowInterstitialAd(false)}
                    onAdCompleted={() => {
                        // Dar uma pequena recompensa por assistir o anúncio intersticial
                        if (userId && userId !== 'guest') {
                            console.log('🎯 Anúncio intersticial completado!');
                            animateCoinsGain({
                                coinsEarned: 2,
                                rewardType: 'interstitial_ad',
                                newBalance: 0, // Será atualizado pelo refreshBalance
                                rewardDescription: 'Anúncio assistido!'
                            });
                            refreshBalance(); // Atualizar saldo real
                        }
                    }}
                    adSlot={getAdUnitId('INTERSTITIAL')}
                    closeDelay={5}
                />
            </Container>
        );
}

export default Home;