import React, { useEffect, useState } from 'react';
import { 
    Box, 
    Typography, 
    Paper, 
    List, 
    ListItem, 
    ListItemIcon, 
    ListItemText, 
    Divider,
    Chip,
    CircularProgress,
    Card,
    CardContent,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Alert,
    Stack
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import coinsApi from '../services/coinsApi';
import { useLocale } from '../contexts/LocaleContext';
import { t } from '../utils/translate';

interface CoinStatementProps {
    userId: string;
    themeMode?: 'light' | 'dark';
}

const CoinStatement: React.FC<CoinStatementProps> = ({ userId, themeMode = 'dark' }) => {
    const { locale } = useLocale();
    const [statement, setStatement] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadStatement = async () => {
            if (!userId || userId === 'guest') {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const data = await coinsApi.getCoinStatement(userId);
                setStatement(data.statement);
            } catch (err: any) {
                console.error('Error loading coin statement:', err);
                setError(t('coinStatement.errors.loadFailed', locale));
            } finally {
                setLoading(false);
            }
        };

        loadStatement();
    }, [userId, locale]);

    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        const dateLocale = locale === 'pt' ? 'pt-BR' : 'en-US';
        return date.toLocaleDateString(dateLocale, { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        });
    };

    const formatDateTime = (dateStr: string): string => {
        const date = new Date(dateStr);
        const dateLocale = locale === 'pt' ? 'pt-BR' : 'en-US';
        return date.toLocaleString(dateLocale, {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getCategoryColor = (reason: string): string => {
        const colorMap: Record<string, string> = {
            'easy_win': '#4caf50',
            'medium_win': '#ff9800', 
            'hard_win': '#f44336',
            'daily_current': '#ffd700',
            'daily_retroactive': '#9e9e9e',
            'blur_win': '#2196f3',
            'text_win': '#9c27b0',
            'hint_purchase': '#ff5722',
            'extra_attempts': '#795548'
        };
        return colorMap[reason] || '#666';
    };

    const getReasonLabel = (reason: string): string => {
        const labelMap: Record<string, string> = {
            'easy_win': t('coinStatement.reasons.easyWin', locale),
            'medium_win': t('coinStatement.reasons.mediumWin', locale),
            'hard_win': t('coinStatement.reasons.hardWin', locale),
            'daily_current': t('coinStatement.reasons.dailyCurrent', locale),
            'daily_retroactive': t('coinStatement.reasons.dailyRetroactive', locale), 
            'blur_win': t('coinStatement.reasons.blurWin', locale),
            'text_win': t('coinStatement.reasons.textWin', locale),
            'hint_purchase': t('coinStatement.reasons.hintPurchase', locale),
            'extra_attempts': t('coinStatement.reasons.extraAttempts', locale),
            'daily_bonus': t('coinStatement.reasons.dailyBonus', locale),
            'speed_bonus': t('coinStatement.reasons.speedBonus', locale),
            'streak_bonus': t('coinStatement.reasons.streakBonus', locale)
        };
        return labelMap[reason] || reason;
    };

    const getTransactionCountLabel = (count: number): string => {
        if (count === 1) {
            return t('coinStatement.transactionCount.one', locale).replace('{{count}}', String(count));
        }
        return t('coinStatement.transactionCount.other', locale).replace('{{count}}', String(count));
    };

    if (!userId || userId === 'guest') {
        return (
            <Box p={3} textAlign="center">
                <Typography variant="h6" sx={{ color: themeMode === 'dark' ? 'text.secondary' : '#333333' }}>
                    {t('coinStatement.guestPrompt', locale)}
                </Typography>
            </Box>
        );
    }

    if (loading) {
        return (
            <Box p={4} display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                <CircularProgress sx={{ color: '#ffd700' }} />
                <Typography variant="body1" sx={{ ml: 2, color: themeMode === 'dark' ? 'text.secondary' : '#333333' }}>
                    {t('coinStatement.loading', locale)}
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={3}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    if (!statement) {
        return (
            <Box p={3} textAlign="center">
                <Typography variant="h6" sx={{ color: themeMode === 'dark' ? 'text.secondary' : '#333333' }}>
                    {t('coinStatement.empty', locale)}
                </Typography>
            </Box>
        );
    }

    const { summary, transactionsByDate, earningsBreakdown, recentTransactions } = statement;

    return (
        <Box sx={{ maxWidth: 900, mx: 'auto', p: { xs: 2, sm: 3 } }}>
            <Typography 
                variant="h3" 
                gutterBottom 
                sx={{ 
                    color: '#ffd700', 
                    fontWeight: 'bold', 
                    textAlign: 'center',
                    mb: 4,
                    fontSize: { xs: '2rem', sm: '3rem' }
                }}
            >
                💰 {t('coinStatement.title', locale)}
            </Typography>

            {/* Resumo - Layout em Grid Organizado */}
            <Box 
                sx={{ 
                    display: 'grid',
                    gridTemplateColumns: { 
                        xs: '1fr',
                        sm: '1fr 1fr',
                        md: '1fr 1fr 1fr 1fr'
                    },
                    gap: 2,
                    mb: 4
                }}
            >
                <Card sx={{ 
                    backgroundColor: themeMode === 'dark' ? '#2a2f42' : '#f8f9fa',
                    borderRadius: 3,
                    border: '2px solid #ffd700'
                }}>
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                        <Typography variant="h4" sx={{ color: '#ffd700', fontWeight: 'bold', mb: 1 }}>
                            {summary.currentBalance.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: themeMode === 'dark' ? 'text.secondary' : '#333333' }}>
                            {t('coinStatement.summary.currentBalance', locale)}
                        </Typography>
                    </CardContent>
                </Card>
                
                <Card sx={{ 
                    backgroundColor: themeMode === 'dark' ? '#1e3a1e' : '#f1f8e9',
                    borderRadius: 3,
                    border: '2px solid #4caf50'
                }}>
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                        <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 'bold', mb: 1 }}>
                            +{summary.totalEarned.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: themeMode === 'dark' ? 'text.secondary' : '#333333' }}>
                            {t('coinStatement.summary.totalEarned', locale)}
                        </Typography>
                    </CardContent>
                </Card>
                
                <Card sx={{ 
                    backgroundColor: themeMode === 'dark' ? '#3a1e1e' : '#ffebee',
                    borderRadius: 3,
                    border: '2px solid #f44336'
                }}>
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                        <Typography variant="h4" sx={{ color: '#f44336', fontWeight: 'bold', mb: 1 }}>
                            -{summary.totalSpent.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: themeMode === 'dark' ? 'text.secondary' : '#333333' }}>
                            {t('coinStatement.summary.totalSpent', locale)}
                        </Typography>
                    </CardContent>
                </Card>
                
                <Card sx={{ 
                    backgroundColor: themeMode === 'dark' ? '#1e2a3a' : '#e3f2fd',
                    borderRadius: 3,
                    border: '2px solid #2196f3'
                }}>
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                        <Typography variant="h4" sx={{ color: '#2196f3', fontWeight: 'bold', mb: 1 }}>
                            +{summary.earnedToday.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: themeMode === 'dark' ? 'text.secondary' : '#333333' }}>
                            {t('coinStatement.summary.earnedToday', locale)}
                        </Typography>
                    </CardContent>
                </Card>
            </Box>

            {/* Ganhos por Categoria - Layout Melhorado */}
            <Paper sx={{ 
                p: 3, 
                mb: 4, 
                backgroundColor: themeMode === 'dark' ? '#23283a' : '#fff',
                borderRadius: 3,
                border: `1px solid ${themeMode === 'dark' ? '#3a4354' : '#e0e0e0'}`
            }}>
                <Typography 
                    variant="h5" 
                    gutterBottom 
                    sx={{ 
                        color: 'primary.main', 
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 3
                    }}
                >
                    📊 {t('coinStatement.earningsByCategory', locale)}
                </Typography>
                <Box 
                    sx={{ 
                        display: 'grid',
                        gridTemplateColumns: { 
                            xs: '1fr',
                            sm: 'repeat(auto-fit, minmax(240px, 1fr))'
                        },
                        gap: 2
                    }}
                >
                    {Object.entries(earningsBreakdown).map(([reason, data]: [string, any]) => (
                        <Card
                            key={reason}
                            sx={{
                                backgroundColor: getCategoryColor(reason),
                                color: '#fff',
                                borderRadius: 2,
                                minHeight: 80
                            }}
                        >
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                    +{data.total}
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                    {getReasonLabel(reason)}
                                </Typography>
                                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                    ({data.count}x)
                                </Typography>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            </Paper>

            {/* Transações Recentes - Layout Limpo */}
            <Paper sx={{ 
                p: 3, 
                mb: 4, 
                backgroundColor: themeMode === 'dark' ? '#23283a' : '#fff',
                borderRadius: 3,
                border: `1px solid ${themeMode === 'dark' ? '#3a4354' : '#e0e0e0'}`
            }}>
                <Typography 
                    variant="h5" 
                    gutterBottom 
                    sx={{ 
                        color: 'primary.main', 
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 3
                    }}
                >
                    🕐 {t('coinStatement.recentTransactions', locale)}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {recentTransactions.map((transaction: any, index: number) => (
                        <Card
                            key={transaction._id || index}
                            sx={{
                                backgroundColor: themeMode === 'dark' ? '#2a2f42' : '#f8f9fa',
                                borderRadius: 2,
                                border: `1px solid ${themeMode === 'dark' ? '#3a4354' : '#dee2e6'}`
                            }}
                        >
                            <CardContent sx={{ py: 2 }}>
                                <Box 
                                    sx={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center',
                                        mb: 1
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Typography sx={{ fontSize: '1.5rem' }}>
                                            {transaction.type === 'earn' ? '💰' : '💸'}
                                        </Typography>
                                        <Box>
                                            <Typography variant="body1" fontWeight="bold" sx={{ color: themeMode === 'dark' ? '#ffffff' : '#000000' }}>
                                                {getReasonLabel(transaction.reason)}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: themeMode === 'dark' ? 'text.secondary' : '#666666' }}>
                                                {formatDateTime(transaction.createdAt)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Chip
                                        label={`${transaction.type === 'earn' ? '+' : '-'}${transaction.amount}`}
                                        sx={{
                                            backgroundColor: transaction.type === 'earn' ? '#4caf50' : '#f44336',
                                            color: '#fff',
                                            fontWeight: 'bold',
                                            fontSize: '0.9rem',
                                            height: 32
                                        }}
                                    />
                                </Box>
                                {transaction.description && (
                                    <Typography variant="body2" sx={{ mt: 1, color: themeMode === 'dark' ? 'text.secondary' : '#666666' }}>
                                        {transaction.description}
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            </Paper>

            {/* Histórico por Data - Design Melhorado */}
            <Paper sx={{ 
                backgroundColor: themeMode === 'dark' ? '#23283a' : '#fff',
                borderRadius: 3,
                border: `1px solid ${themeMode === 'dark' ? '#3a4354' : '#e0e0e0'}`
            }}>
                <Box sx={{ p: 3, borderBottom: `1px solid ${themeMode === 'dark' ? '#3a4354' : '#e0e0e0'}` }}>
                    <Typography 
                        variant="h5" 
                        sx={{ 
                            color: 'primary.main', 
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                        }}
                    >
                        📅 {t('coinStatement.fullHistory', locale)}
                    </Typography>
                </Box>
                {Object.entries(transactionsByDate)
                    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                    .map(([date, transactions]: [string, any]) => (
                        <Accordion 
                            key={date}
                            sx={{
                                backgroundColor: 'transparent',
                                border: 'none',
                                boxShadow: 'none',
                                '&:before': { display: 'none' },
                                borderBottom: `1px solid ${themeMode === 'dark' ? '#3a4354' : '#e0e0e0'}`
                            }}
                        >
                            <AccordionSummary 
                                expandIcon={<ExpandMoreIcon />}
                                sx={{
                                    backgroundColor: 'transparent',
                                    '&:hover': {
                                        backgroundColor: themeMode === 'dark' ? '#2a2f42' : '#f8f9fa'
                                    }
                                }}
                            >
                                <Box display="flex" justifyContent="space-between" width="100%" mr={2}>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        {formatDate(date)}
                                    </Typography>
                                    <Chip
                                        label={getTransactionCountLabel(transactions.length)}
                                        size="small"
                                        sx={{
                                            backgroundColor: themeMode === 'dark' ? '#3a4354' : '#e0e0e0',
                                            color: 'text.primary'
                                        }}
                                    />
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails sx={{ backgroundColor: 'transparent', pt: 0 }}>
                                <List>
                                    {transactions.map((transaction: any, index: number) => (
                                        <React.Fragment key={transaction._id || index}>
                                            <ListItem>
                                                <ListItemText
                                                    primary={
                                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                                            <Typography variant="body2">
                                                                {transaction.formattedTime} - {getReasonLabel(transaction.reason)}
                                                            </Typography>
                                                            <Typography 
                                                                variant="body2" 
                                                                fontWeight="bold"
                                                                color={transaction.type === 'earn' ? '#4caf50' : '#f44336'}
                                                            >
                                                                {transaction.displayAmount}
                                                            </Typography>
                                                        </Box>
                                                    }
                                                    secondary={transaction.description}
                                                />
                                            </ListItem>
                                            {index < transactions.length - 1 && <Divider />}
                                        </React.Fragment>
                                    ))}
                                </List>
                            </AccordionDetails>
                        </Accordion>
                    ))}
            </Paper>
        </Box>
    );
};

export default CoinStatement;