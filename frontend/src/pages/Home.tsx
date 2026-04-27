import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell, { GameMode } from '../components/AppShell';
import ModePicker from '../components/ModePicker';
import CardGuess from '../components/CardGuess';
import GuessHistory from '../components/GuessHistory';
import VictoryScreen from '../components/VictoryScreen';
import BlurredCard from '../components/BlurredCard';
import TextCard from '../components/TextCard';
import HintsBar from '../components/HintsBar';
import CoinDisplay from '../components/CoinDisplay';
import { useCoins } from '../contexts/CoinsContext';
import { useLocale } from '../contexts/LocaleContext';
import { t } from '../utils/translate';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

interface HomeProps {
    userId: string;
    name: string;
    email: string;
    onProfileClick: () => void;
    onCoinsClick: () => void;
}

type Mode = Exclude<GameMode, 'leaderboards'>;

const Home: React.FC<HomeProps> = ({ userId, name, email, onProfileClick, onCoinsClick }) => {
    const navigate = useNavigate();
    const { animateCoinsGain } = useCoins();
    const { locale } = useLocale();

    const [mode, setMode] = useState<Mode>('classic');
    const [gameStarted, setGameStarted] = useState(false);
    const [gameId, setGameId] = useState<string | null>(null);
    const [targetCard, setTargetCard] = useState<string | null>(null);
    const [guesses, setGuesses] = useState<any[]>([]);
    const [victory, setVictory] = useState(false);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [endTime, setEndTime] = useState<number | null>(null);
    const [wrongCount, setWrongCount] = useState(0);

    const [textReady, setTextReady] = useState<string | null>(null);
    const [textShown, setTextShown] = useState(false);
    const [flavorReady, setFlavorReady] = useState<string | null>(null);
    const [flavorShown, setFlavorShown] = useState(false);

    const [cardImageUrl, setCardImageUrl] = useState<string | null>(null);
    const [cardTextData, setCardTextData] = useState<{text: string; type: string; manaCost: number; hasCensoredContent?: boolean} | null>(null);
    const [maxBlurAttempts, setMaxBlurAttempts] = useState(-1);
    const [currentBlurLevel, setCurrentBlurLevel] = useState<number>(5);
    const [textManaCostShown, setTextManaCostShown] = useState(false);
    const [textCardTypeShown, setTextCardTypeShown] = useState(false);

    useEffect(() => {
        // log API URL once for diagnostics
        // eslint-disable-next-line no-console
        console.log('API_URL:', process.env.REACT_APP_API_URL);
    }, []);

    const guessedNames = useMemo(
        () => guesses.map(g => g.guessedCard?.name).filter(Boolean) as string[],
        [guesses]
    );

    const resetGame = () => {
        setGameStarted(false);
        setVictory(false);
        setGuesses([]);
        setGameId(null);
        setTargetCard(null);
        setTextReady(null); setTextShown(false);
        setFlavorReady(null); setFlavorShown(false);
        setWrongCount(0);
        setStartTime(null); setEndTime(null);
        setCardImageUrl(null); setCardTextData(null);
        setMaxBlurAttempts(-1); setCurrentBlurLevel(5);
        setTextManaCostShown(false); setTextCardTypeShown(false);
    };

    const handleSelectTab = (tab: GameMode) => {
        if (tab === 'leaderboards') {
            navigate('/leaderboards');
            return;
        }
        if (mode !== tab) {
            setMode(tab);
            resetGame();
        }
    };

    const handleGameStarted = (cardName: string, newGameId: string, gameData?: any) => {
        setGameStarted(true);
        setTargetCard(cardName);
        setGameId(newGameId);
        setGuesses([]);
        setTextReady(null); setTextShown(false);
        setFlavorReady(null); setFlavorShown(false);
        setWrongCount(0);
        setVictory(false);
        setStartTime(Date.now()); setEndTime(null);
        setTextManaCostShown(false); setTextCardTypeShown(false);

        const isBlur = newGameId.startsWith('blur-') || gameData?.gameMode === 'blur';
        const isText = newGameId.startsWith('text-') || gameData?.gameMode === 'text';

        if (isBlur && gameData) {
            setCardImageUrl(gameData.cardImage || null);
            setMaxBlurAttempts(gameData.maxBlurAttempts ?? -1);
            setCurrentBlurLevel(gameData.initialBlur ?? 5);
            setCardTextData(null);
        } else if (isText && gameData) {
            setCardImageUrl(gameData.cardImage || null);
            setCardTextData({
                text: gameData.cardText || '',
                type: gameData.cardType || '',
                manaCost: gameData.manaCost || 0,
                hasCensoredContent: gameData.hasCensoredContent || false,
            });
        } else {
            setCardImageUrl(null);
            setCardTextData(null);
        }
    };

    const handleGuess = (result: any) => {
        setGuesses(prev => [result, ...prev]);
        if (result.feedback?.text && typeof result.feedback.text === 'string') {
            setTextReady(result.feedback.text);
        }
        if (result.feedback?.flavor && typeof result.feedback.flavor === 'string') {
            setFlavorReady(result.feedback.flavor);
        }
        if (result.feedback?.blurInfo) {
            setCurrentBlurLevel(result.feedback.blurInfo.blurLevel || 0);
        }
        if (!result.isCorrect) {
            setWrongCount(prev => prev + 1);
        } else {
            setVictory(true);
            setEndTime(Date.now());
            setWrongCount(0);
            if (result.coinReward && userId && userId !== 'guest') {
                animateCoinsGain(result.coinReward);
            }
        }
    };

    const onHintPurchased = () => {
        setTextManaCostShown(true);
        setTextCardTypeShown(true);
    };

    const rightSlot = (
        <>
            <CoinDisplay userId={userId} onClick={onCoinsClick} />
            {userId !== 'guest' && (
                <button type="button" className="gc-icon-btn" onClick={onProfileClick} aria-label="Profile">
                    <AccountCircleIcon fontSize="small" />
                </button>
            )}
        </>
    );

    // --- LANDING ---
    if (!gameStarted) {
        return (
            <AppShell active={mode} onSelect={handleSelectTab} rightSlot={rightSlot} onBrandClick={resetGame}>
                <h1 className="gc-page-title">
                    Guess<span className="accent">Card</span>
                </h1>
                <p className="gc-page-subtitle">{t('shell.tagline', locale)}</p>
                <ModePicker mode={mode} userId={userId} onGameStarted={handleGameStarted} />
            </AppShell>
        );
    }

    // --- VICTORY ---
    if (victory) {
        const attemptsCount = guesses.length;
        const timeSpent = startTime && endTime ? Math.round((endTime - startTime) / 1000) : 0;
        const lastGuess = guesses.find(g => g.isCorrect) || guesses[0];
        const cardName = lastGuess?.guessedCard?.name || targetCard || '-';
        const cardImage = lastGuess?.guessedCard?.imageUrl || cardImageUrl || '';
        return (
            <AppShell active={mode} onSelect={handleSelectTab} rightSlot={rightSlot} onBrandClick={resetGame}>
                <VictoryScreen
                    onRestart={resetGame}
                    attempts={attemptsCount}
                    timeSpent={timeSpent}
                    cardName={cardName}
                    cardImage={cardImage}
                />
            </AppShell>
        );
    }

    // --- IN-GAME ---
    return (
        <AppShell active={mode} onSelect={handleSelectTab} rightSlot={rightSlot} onBrandClick={resetGame}>
            <h1 className="gc-page-title">
                {mode === 'daily' ? t('start.dailyMode.title', locale)
                : mode === 'text' ? t('start.textMode.title', locale)
                : mode === 'blur' ? t('start.blurMode.title', locale)
                : t('home.title', locale)}
            </h1>

            <div className="gc-guess-meta">
                <span className="count">{
                    guesses.length === 1
                        ? t('shell.guessesCountOne', locale)
                        : t('shell.guessesCount', locale).replace('{{count}}', String(guesses.length))
                }</span>
            </div>

            {mode === 'blur' && cardImageUrl && (
                <BlurredCard
                    imageUrl={cardImageUrl}
                    attempts={wrongCount}
                    maxAttempts={maxBlurAttempts}
                    cardName={targetCard || undefined}
                    showCard={false}
                    blurLevel={currentBlurLevel}
                />
            )}

            {mode === 'text' && cardTextData && (
                <TextCard
                    cardText={cardTextData.text}
                    cardType={cardTextData.type}
                    manaCost={cardTextData.manaCost}
                    cardName={targetCard || undefined}
                    hasCensoredContent={cardTextData.hasCensoredContent}
                    gameId={gameId || undefined}
                    userId={userId}
                    showManaCost={textManaCostShown}
                    showCardType={textCardTypeShown}
                    onHintPurchased={onHintPurchased}
                />
            )}

            {(mode === 'classic' || mode === 'daily') && (
                <HintsBar
                    attempts={wrongCount}
                    flavorReady={flavorReady}
                    flavorShown={flavorShown}
                    onFlavor={() => flavorReady && setFlavorShown(true)}
                    effectReady={textReady}
                    effectShown={textShown}
                    onEffect={() => textReady && setTextShown(true)}
                    hasFeedback={guesses.length > 0}
                />
            )}

            {flavorShown && flavorReady && (
                <div className="gc-hint-card"><strong>Flavor</strong>{flavorReady}</div>
            )}
            {textShown && textReady && (
                <div className="gc-hint-card"><strong>Effect</strong>{textReady}</div>
            )}

            <CardGuess
                onGuess={handleGuess}
                gameId={gameId}
                userId={userId}
                name={name}
                email={email}
                attempts={guesses.length + 1}
                timeSpent={startTime ? Math.round(((endTime || Date.now()) - startTime) / 1000) : 0}
                excluded={guessedNames}
            />

            <GuessHistory guesses={guesses} />

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
                <button className="gc-btn gc-btn-ghost" onClick={resetGame}>{t('home.menu', locale)}</button>
                <button className="gc-btn gc-btn-ghost" onClick={() => navigate('/leaderboards')}>{t('home.viewRankings', locale)}</button>
            </div>
        </AppShell>
    );
};

export default Home;
