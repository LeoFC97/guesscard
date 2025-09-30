import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    CircularProgress,
    ToggleButton,
    ToggleButtonGroup,
    Card,
    CardContent
} from '@mui/material';
import {
    EmojiEvents as TrophyIcon,
    Speed as SpeedIcon,
    Stars as PerfectIcon,
    CalendarToday as DailyIcon,
    Visibility as BlurIcon
} from '@mui/icons-material';
import {
    getNormalLeaderboard,
    getDailyLeaderboard,
    getSpeedLeaderboard,
    getPerfectLeaderboard,
    getBlurLeaderboard,
    getBlurSpeedLeaderboard,
    getBlurPerfectLeaderboard,
    LeaderboardEntry,
    DailyLeaderboardEntry,
    SpeedLeaderboardEntry,
    PerfectLeaderboardEntry,
    BlurLeaderboardEntry,
    BlurSpeedLeaderboardEntry,
    BlurPerfectLeaderboardEntry
} from '../services/leaderboardApi';

interface LeaderboardsProps {
    themeMode?: 'light' | 'dark';
}

type LeaderboardType = 'normal' | 'daily' | 'speed' | 'perfect' | 'blur' | 'blur-speed' | 'blur-perfect';
type GameType = 'normal' | 'daily';

const Leaderboards: React.FC<LeaderboardsProps> = ({ themeMode = 'dark' }) => {
    const [selectedType, setSelectedType] = useState<LeaderboardType>('blur');
    const [gameType, setGameType] = useState<GameType>('daily');
    const [loading, setLoading] = useState(false);
    const [normalData, setNormalData] = useState<LeaderboardEntry[]>([]);
    const [dailyData, setDailyData] = useState<DailyLeaderboardEntry[]>([]);
    const [speedData, setSpeedData] = useState<SpeedLeaderboardEntry[]>([]);
    const [perfectData, setPerfectData] = useState<PerfectLeaderboardEntry[]>([]);
    const [blurData, setBlurData] = useState<BlurLeaderboardEntry[]>([]);
    const [blurSpeedData, setBlurSpeedData] = useState<BlurSpeedLeaderboardEntry[]>([]);
    const [blurPerfectData, setBlurPerfectData] = useState<BlurPerfectLeaderboardEntry[]>([]);

    const isDark = themeMode === 'dark';

    useEffect(() => {
        loadLeaderboard();
    }, [selectedType, gameType]);

    const loadLeaderboard = async () => {
        setLoading(true);
        try {
            switch (selectedType) {
                case 'normal':
                    const normal = await getNormalLeaderboard(50);
                    setNormalData(normal);
                    break;
                case 'daily':
                    const daily = await getDailyLeaderboard(50);
                    setDailyData(daily);
                    break;
                case 'speed':
                    const speed = await getSpeedLeaderboard(gameType, 50);
                    setSpeedData(speed);
                    break;
                case 'perfect':
                    const perfect = await getPerfectLeaderboard(gameType, 50);
                    setPerfectData(perfect);
                    break;
                case 'blur':
                    const blur = await getBlurLeaderboard(50);
                    setBlurData(blur);
                    break;
                case 'blur-speed':
                    const blurSpeed = await getBlurSpeedLeaderboard(50);
                    setBlurSpeedData(blurSpeed);
                    break;
                case 'blur-perfect':
                    const blurPerfect = await getBlurPerfectLeaderboard(50);
                    setBlurPerfectData(blurPerfect);
                    break;
            }
        } catch (error) {
            console.error('Error loading leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds: number): string => {
        if (seconds < 60) {
            return `${seconds}s`;
        }
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    };

    const getRankIcon = (rank: number) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `#${rank}`;
    };

    const renderNormalLeaderboard = () => (
        <TableContainer component={Paper} sx={{ maxHeight: 600, backgroundColor: isDark ? '#2a2a2a' : '#fff' }}>
            <Table stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>Posição</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>Jogador</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>Jogos</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>Média Tentativas</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>Média Tempo</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>Melhor Tempo</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>Melhores Tentativas</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {normalData.map((entry, index) => (
                        <TableRow key={entry.userId} sx={{ '&:nth-of-type(odd)': { backgroundColor: isDark ? '#333' : '#f9f9f9' } }}>
                            <TableCell sx={{ color: isDark ? '#fff' : '#000' }}>
                                <Typography variant="h6">{getRankIcon(index + 1)}</Typography>
                            </TableCell>
                            <TableCell sx={{ color: isDark ? '#fff' : '#000' }}>
                                <Typography variant="body2" fontWeight={600}>{entry.name}</Typography>
                            </TableCell>
                            <TableCell sx={{ color: isDark ? '#fff' : '#000' }}>
                                <Chip label={entry.totalGames} color="primary" size="small" />
                            </TableCell>
                            <TableCell sx={{ color: isDark ? '#fff' : '#000' }}>{entry.averageAttempts}</TableCell>
                            <TableCell sx={{ color: isDark ? '#fff' : '#000' }}>{formatTime(entry.averageTime)}</TableCell>
                            <TableCell sx={{ color: isDark ? '#fff' : '#000' }}>{formatTime(entry.bestTime)}</TableCell>
                            <TableCell sx={{ color: isDark ? '#fff' : '#000' }}>{entry.bestAttempts}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );

    const renderDailyLeaderboard = () => (
        <TableContainer component={Paper} sx={{ maxHeight: 600, backgroundColor: isDark ? '#2a2a2a' : '#fff' }}>
            <Table stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>Posição</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>Jogador</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>Dias Jogados</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>Sequência Atual</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>Maior Sequência</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>Média Tentativas</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>Melhor Tempo</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {dailyData.map((entry, index) => (
                        <TableRow key={entry.userId} sx={{ '&:nth-of-type(odd)': { backgroundColor: isDark ? '#333' : '#f9f9f9' } }}>
                            <TableCell sx={{ color: isDark ? '#fff' : '#000' }}>
                                <Typography variant="h6">{getRankIcon(index + 1)}</Typography>
                            </TableCell>
                            <TableCell sx={{ color: isDark ? '#fff' : '#000' }}>
                                <Typography variant="body2" fontWeight={600}>{entry.name}</Typography>
                            </TableCell>
                            <TableCell sx={{ color: isDark ? '#fff' : '#000' }}>
                                <Chip label={entry.totalDailyGames} color="primary" size="small" />
                            </TableCell>
                            <TableCell sx={{ color: isDark ? '#fff' : '#000' }}>
                                <Chip 
                                    label={`${entry.currentStreak} 🔥`} 
                                    color={entry.currentStreak > 0 ? "success" : "default"} 
                                    size="small" 
                                />
                            </TableCell>
                            <TableCell sx={{ color: isDark ? '#fff' : '#000' }}>
                                <Chip label={entry.longestStreak} color="warning" size="small" />
                            </TableCell>
                            <TableCell sx={{ color: isDark ? '#fff' : '#000' }}>{entry.averageAttempts}</TableCell>
                            <TableCell sx={{ color: isDark ? '#fff' : '#000' }}>{formatTime(entry.bestTime)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );

    const renderSpeedLeaderboard = () => (
        <TableContainer component={Paper} sx={{ maxHeight: 600, backgroundColor: isDark ? '#2a2a2a' : '#fff' }}>
            <Table stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>Posição</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>Jogador</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>Melhor Tempo</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>Tentativas</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>Total Jogos</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>Data</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {speedData.map((entry, index) => (
                        <TableRow key={entry.userId} sx={{ '&:nth-of-type(odd)': { backgroundColor: isDark ? '#333' : '#f9f9f9' } }}>
                            <TableCell sx={{ color: isDark ? '#fff' : '#000' }}>
                                <Typography variant="h6">{getRankIcon(index + 1)}</Typography>
                            </TableCell>
                            <TableCell sx={{ color: isDark ? '#fff' : '#000' }}>
                                <Typography variant="body2" fontWeight={600}>{entry.name}</Typography>
                            </TableCell>
                            <TableCell sx={{ color: isDark ? '#fff' : '#000' }}>
                                <Chip label={formatTime(entry.bestTime)} color="error" size="small" />
                            </TableCell>
                            <TableCell sx={{ color: isDark ? '#fff' : '#000' }}>{entry.bestAttempts}</TableCell>
                            <TableCell sx={{ color: isDark ? '#fff' : '#000' }}>{entry.totalGames}</TableCell>
                            <TableCell sx={{ color: isDark ? '#fff' : '#000' }}>
                                {new Date(entry.bestDate).toLocaleDateString()}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );

    const renderPerfectLeaderboard = () => (
        <TableContainer component={Paper} sx={{ maxHeight: 600, backgroundColor: isDark ? '#2a2a2a' : '#fff' }}>
            <Table stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>Posição</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>Jogador</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>Melhores Tentativas</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>Tempo</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>Total Jogos</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>Data</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {perfectData.map((entry, index) => (
                        <TableRow key={entry.userId} sx={{ '&:nth-of-type(odd)': { backgroundColor: isDark ? '#333' : '#f9f9f9' } }}>
                            <TableCell sx={{ color: isDark ? '#fff' : '#000' }}>
                                <Typography variant="h6">{getRankIcon(index + 1)}</Typography>
                            </TableCell>
                            <TableCell sx={{ color: isDark ? '#fff' : '#000' }}>
                                <Typography variant="body2" fontWeight={600}>{entry.name}</Typography>
                            </TableCell>
                            <TableCell sx={{ color: isDark ? '#fff' : '#000' }}>
                                <Chip label={entry.bestAttempts} color="success" size="small" />
                            </TableCell>
                            <TableCell sx={{ color: isDark ? '#fff' : '#000' }}>{formatTime(entry.bestTime)}</TableCell>
                            <TableCell sx={{ color: isDark ? '#fff' : '#000' }}>{entry.totalGames}</TableCell>
                            <TableCell sx={{ color: isDark ? '#fff' : '#000' }}>
                                {new Date(entry.bestDate).toLocaleDateString()}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );

    const renderBlurLeaderboard = () => (
        <TableContainer component={Paper} sx={{ maxHeight: 600, backgroundColor: isDark ? '#2a2a2a' : '#fff' }}>
            <Table stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>Posição</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>Jogador</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>Jogos Blur</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>Média Tentativas</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>Média Blur</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>Tempo Médio</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {blurData.map((entry, index) => (
                        <TableRow key={entry._id} sx={{ '&:nth-of-type(odd)': { backgroundColor: isDark ? '#333' : '#f9f9f9' } }}>
                            <TableCell sx={{ color: isDark ? '#fff' : '#000' }}>
                                <Typography variant="h6">{getRankIcon(index + 1)}</Typography>
                            </TableCell>
                            <TableCell sx={{ color: isDark ? '#fff' : '#000' }}>
                                <Typography variant="body2" fontWeight={600}>{entry.name}</Typography>
                            </TableCell>
                            <TableCell sx={{ color: isDark ? '#fff' : '#000' }}>
                                <Chip label={entry.games} color="secondary" size="small" />
                            </TableCell>
                            <TableCell sx={{ color: isDark ? '#fff' : '#000' }}>{entry.avgAttemptsPerGame?.toFixed(1)}</TableCell>
                            <TableCell sx={{ color: isDark ? '#fff' : '#000' }}>{entry.avgBlurAttemptsPerGame?.toFixed(1)}</TableCell>
                            <TableCell sx={{ color: isDark ? '#fff' : '#000' }}>{formatTime(Math.round(entry.avgTimeSpent))}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );

    const renderBlurSpeedLeaderboard = () => (
        <TableContainer component={Paper} sx={{ maxHeight: 600, backgroundColor: isDark ? '#2a2a2a' : '#fff' }}>
            <Table stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>Posição</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>Jogador</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>Melhor Tempo</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>Tempo Médio</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>Jogos Blur</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {blurSpeedData.map((entry, index) => (
                        <TableRow key={entry._id} sx={{ '&:nth-of-type(odd)': { backgroundColor: isDark ? '#333' : '#f9f9f9' } }}>
                            <TableCell sx={{ color: isDark ? '#fff' : '#000' }}>
                                <Typography variant="h6">{getRankIcon(index + 1)}</Typography>
                            </TableCell>
                            <TableCell sx={{ color: isDark ? '#fff' : '#000' }}>
                                <Typography variant="body2" fontWeight={600}>{entry.name}</Typography>
                            </TableCell>
                            <TableCell sx={{ color: isDark ? '#fff' : '#000' }}>
                                <Chip label={formatTime(entry.fastestTime)} color="error" size="small" />
                            </TableCell>
                            <TableCell sx={{ color: isDark ? '#fff' : '#000' }}>{formatTime(Math.round(entry.avgTime))}</TableCell>
                            <TableCell sx={{ color: isDark ? '#fff' : '#000' }}>{entry.games}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );

    const renderBlurPerfectLeaderboard = () => (
        <TableContainer component={Paper} sx={{ maxHeight: 600, backgroundColor: isDark ? '#2a2a2a' : '#fff' }}>
            <Table stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>Posição</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>Jogador</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>Jogos Perfeitos</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>Melhor Tempo</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>Tempo Médio</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {blurPerfectData.map((entry, index) => (
                        <TableRow key={entry._id} sx={{ '&:nth-of-type(odd)': { backgroundColor: isDark ? '#333' : '#f9f9f9' } }}>
                            <TableCell sx={{ color: isDark ? '#fff' : '#000' }}>
                                <Typography variant="h6">{getRankIcon(index + 1)}</Typography>
                            </TableCell>
                            <TableCell sx={{ color: isDark ? '#fff' : '#000' }}>
                                <Typography variant="body2" fontWeight={600}>{entry.name}</Typography>
                            </TableCell>
                            <TableCell sx={{ color: isDark ? '#fff' : '#000' }}>
                                <Chip label={entry.perfectGames} color="success" size="small" />
                            </TableCell>
                            <TableCell sx={{ color: isDark ? '#fff' : '#000' }}>{formatTime(entry.fastestPerfect)}</TableCell>
                            <TableCell sx={{ color: isDark ? '#fff' : '#000' }}>{formatTime(Math.round(entry.avgTimeSpent))}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );

    return (
        <Box sx={{ p: 3, backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', minHeight: '100vh' }}>
            <Typography variant="h4" gutterBottom sx={{ color: isDark ? '#fff' : '#000', textAlign: 'center', mb: 4 }}>
                🏆 Leaderboards {selectedType.includes('blur') && '🔍'}
            </Typography>

            <Card sx={{ mb: 3, backgroundColor: isDark ? '#2a2a2a' : '#fff' }}>
                <CardContent>
                    <Tabs 
                        value={selectedType} 
                        onChange={(_, newValue) => setSelectedType(newValue)}
                        centered
                        sx={{ mb: 2 }}
                    >
                        <Tab label="Jogos Normais" value="normal" icon={<TrophyIcon />} />
                        <Tab label="Jogos Diários" value="daily" icon={<DailyIcon />} />
                        <Tab label="Modo Blur" value="blur" icon={<BlurIcon />} />
                        <Tab label="Blur - Velocidade" value="blur-speed" icon={<SpeedIcon />} />
                        <Tab label="Blur - Perfeitos" value="blur-perfect" icon={<PerfectIcon />} />
                        <Tab label="Melhores Tempos" value="speed" icon={<SpeedIcon />} />
                        <Tab label="Menos Tentativas" value="perfect" />
                    </Tabs>

                    {(selectedType === 'speed' || selectedType === 'perfect') && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                            <ToggleButtonGroup
                                value={gameType}
                                exclusive
                                onChange={(_, newGameType) => newGameType && setGameType(newGameType)}
                                size="small"
                            >
                                <ToggleButton value="normal">Jogos Normais</ToggleButton>
                                <ToggleButton value="daily">Jogos Diários</ToggleButton>
                            </ToggleButtonGroup>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Box>
                    {selectedType.includes('blur') && (
                        <Box sx={{ mb: 2, p: 2, backgroundColor: isDark ? '#2a2a4a' : '#f0f0ff', borderRadius: 2 }}>
                            <Typography variant="body2" sx={{ color: isDark ? '#bb86fc' : '#6200ea', textAlign: 'center' }}>
                                🔍 Rankings do Modo Blur - Cartas que ficam mais nítidas a cada palpite!
                            </Typography>
                        </Box>
                    )}
                    {selectedType === 'normal' && renderNormalLeaderboard()}
                    {selectedType === 'daily' && renderDailyLeaderboard()}
                    {selectedType === 'blur' && renderBlurLeaderboard()}
                    {selectedType === 'blur-speed' && renderBlurSpeedLeaderboard()}
                    {selectedType === 'blur-perfect' && renderBlurPerfectLeaderboard()}
                    {selectedType === 'speed' && renderSpeedLeaderboard()}
                    {selectedType === 'perfect' && renderPerfectLeaderboard()}
                </Box>
            )}
        </Box>
    );
};

export default Leaderboards;