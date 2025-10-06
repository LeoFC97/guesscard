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

interface CoinStatementProps {
    userId: string;
    themeMode?: 'light' | 'dark';
}

const CoinStatement: React.FC<CoinStatementProps> = ({ userId, themeMode = 'dark' }) => {
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
                setError('Erro ao carregar extrato de moedas');
            } finally {
                setLoading(false);
            }
        };

        loadStatement();
    }, [userId]);

    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        });
    };

    const formatDateTime = (dateStr: string): string => {
        const date = new Date(dateStr);
        return date.toLocaleString('pt-BR', {
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
            'easy_win': 'Vitória Fácil',
            'medium_win': 'Vitória Médio',
            'hard_win': 'Vitória Difícil',
            'daily_current': 'Diário (Mesmo Dia)',
            'daily_retroactive': 'Diário (Retroativo)', 
            'blur_win': 'Modo Blur',
            'text_win': 'Modo Texto',
            'hint_purchase': 'Compra de Dica',
            'extra_attempts': 'Tentativas Extra',
            'daily_bonus': 'Bônus Diário',
            'speed_bonus': 'Bônus Velocidade',
            'streak_bonus': 'Bônus Sequência'
        };
        return labelMap[reason] || reason;
    };

    if (!userId || userId === 'guest') {
        return (
            <Box p={3} textAlign="center">
                <Typography variant="h6" color="text.secondary">
                    Faça login para ver seu extrato de moedas
                </Typography>
            </Box>
        );
    }

    if (loading) {
        return (
            <Box p={4} display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                <CircularProgress sx={{ color: '#ffd700' }} />
                <Typography variant="body1" sx={{ ml: 2, color: 'text.secondary' }}>
                    Carregando extrato...
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
                <Typography variant="h6" color="text.secondary">
                    Nenhuma transação encontrada
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
                💰 Extrato de Moedas
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
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Saldo Atual
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
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Total Ganho
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
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Total Gasto
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
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Ganho Hoje
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
                    📊 Ganhos por Categoria
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
                    🕐 Transações Recentes
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
                                            <Typography variant="body1" fontWeight="bold">
                                                {getReasonLabel(transaction.reason)}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
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
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
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
                        📅 Histórico Completo
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
                                        label={`${transactions.length} transaç${transactions.length === 1 ? 'ão' : 'ões'}`}
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