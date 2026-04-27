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
import { useLocale } from '../contexts/LocaleContext';
import { t } from '../utils/translate';

interface LeaderboardsProps {
    themeMode?: 'light' | 'dark';
}

type LeaderboardType = 'normal' | 'daily' | 'speed' | 'perfect' | 'blur' | 'blur-speed' | 'blur-perfect';
type GameType = 'normal' | 'daily';

const Leaderboards: React.FC<LeaderboardsProps> = ({ themeMode = 'dark' }) => {
    const { locale } = useLocale();
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
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>{t('leaderboards.headers.position', locale)}</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>{t('leaderboards.headers.player', locale)}</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>{t('leaderboards.headers.games', locale)}</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>{t('leaderboards.headers.avgAttempts', locale)}</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>{t('leaderboards.headers.avgTime', locale)}</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>{t('leaderboards.headers.bestTime', locale)}</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>{t('leaderboards.headers.bestAttempts', locale)}</TableCell>
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
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>{t('leaderboards.headers.position', locale)}</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>{t('leaderboards.headers.player', locale)}</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>{t('leaderboards.headers.daysPlayed', locale)}</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>{t('leaderboards.headers.currentStreak', locale)}</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>{t('leaderboards.headers.longestStreak', locale)}</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>{t('leaderboards.headers.avgAttempts', locale)}</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>{t('leaderboards.headers.bestTime', locale)}</TableCell>
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
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>{t('leaderboards.headers.position', locale)}</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>{t('leaderboards.headers.player', locale)}</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>{t('leaderboards.headers.bestTime', locale)}</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>{t('leaderboards.headers.attempts', locale)}</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>{t('leaderboards.headers.totalGames', locale)}</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>{t('leaderboards.headers.date', locale)}</TableCell>
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
                                <Chip label={formatTime(entry.bestTime)} color="info" size="small" />
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
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>{t('leaderboards.headers.position', locale)}</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>{t('leaderboards.headers.player', locale)}</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>{t('leaderboards.headers.bestAttempts', locale)}</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>{t('leaderboards.headers.time', locale)}</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>{t('leaderboards.headers.totalGames', locale)}</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>{t('leaderboards.headers.date', locale)}</TableCell>
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
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>{t('leaderboards.headers.position', locale)}</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>{t('leaderboards.headers.player', locale)}</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>{t('leaderboards.headers.blurGames', locale)}</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>{t('leaderboards.headers.avgAttempts', locale)}</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>{t('leaderboards.headers.avgBlur', locale)}</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>{t('leaderboards.headers.avgTime', locale)}</TableCell>
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
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>{t('leaderboards.headers.position', locale)}</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>{t('leaderboards.headers.player', locale)}</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>{t('leaderboards.headers.bestTime', locale)}</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>{t('leaderboards.headers.avgTime', locale)}</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>{t('leaderboards.headers.blurGames', locale)}</TableCell>
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
                                <Chip label={formatTime(entry.fastestTime)} color="info" size="small" />
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
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>{t('leaderboards.headers.position', locale)}</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>{t('leaderboards.headers.player', locale)}</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>{t('leaderboards.headers.perfectGames', locale)}</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>{t('leaderboards.headers.bestTime', locale)}</TableCell>
                        <TableCell sx={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', color: isDark ? '#fff' : '#000' }}>{t('leaderboards.headers.avgTime', locale)}</TableCell>
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
        <Box sx={{ p: { xs: 1, sm: 3 }, backgroundColor: 'transparent', minHeight: '100vh' }}>
            <Typography variant="h4" gutterBottom sx={{ color: isDark ? '#fff' : '#000', textAlign: 'center', mb: { xs: 2, sm: 4 }, fontSize: { xs: '1.5rem', sm: '2rem' }, fontWeight: 200, letterSpacing: 0.5 }}>
                🏆 {t('leaderboards.title', locale)} {selectedType.includes('blur') && '🔍'}
            </Typography>

            <Card sx={{ mb: 3, backgroundColor: isDark ? '#16242c' : '#fff', border: '1px solid #2d3c45' }}>
                <CardContent sx={{ p: { xs: 1, sm: 2 }, '&:last-child': { pb: { xs: 1, sm: 2 } } }}>
                    <Tabs
                        value={selectedType}
                        onChange={(_, newValue) => setSelectedType(newValue)}
                        variant="scrollable"
                        scrollButtons="auto"
                        allowScrollButtonsMobile
                        sx={{
                            mb: 2,
                            '& .MuiTab-root': {
                                minWidth: { xs: 88, sm: 110 },
                                px: { xs: 1, sm: 2 },
                                fontSize: { xs: '0.72rem', sm: '0.875rem' },
                                textTransform: 'none',
                            },
                        }}
                    >
                        <Tab label={t('leaderboards.tabs.normal', locale)} value="normal" icon={<TrophyIcon />} />
                        <Tab label={t('leaderboards.tabs.daily', locale)} value="daily" icon={<DailyIcon />} />
                        <Tab label={t('leaderboards.tabs.blur', locale)} value="blur" icon={<BlurIcon />} />
                        <Tab label={t('leaderboards.tabs.blurSpeed', locale)} value="blur-speed" icon={<SpeedIcon />} />
                        <Tab label={t('leaderboards.tabs.blurPerfect', locale)} value="blur-perfect" icon={<PerfectIcon />} />
                        <Tab label={t('leaderboards.tabs.speed', locale)} value="speed" icon={<SpeedIcon />} />
                        <Tab label={t('leaderboards.tabs.perfect', locale)} value="perfect" />
                    </Tabs>

                    {(selectedType === 'speed' || selectedType === 'perfect') && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                            <ToggleButtonGroup
                                value={gameType}
                                exclusive
                                onChange={(_, newGameType) => newGameType && setGameType(newGameType)}
                                size="small"
                            >
                                <ToggleButton value="normal">{t('leaderboards.tabs.normal', locale)}</ToggleButton>
                                <ToggleButton value="daily">{t('leaderboards.tabs.daily', locale)}</ToggleButton>
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
                                🔍 {t('leaderboards.blurInfo', locale)}
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