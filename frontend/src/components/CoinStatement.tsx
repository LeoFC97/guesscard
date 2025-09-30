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
        <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
            <Typography 
                variant="h4" 
                gutterBottom 
                sx={{ 
                    color: '#ffd700', 
                    fontWeight: 'bold', 
                    textAlign: 'center',
                    mb: 3
                }}
            >
                💰 Extrato de Moedas
            </Typography>

            {/* Resumo */}
            <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2} 
                sx={{ mb: 3 }}
                flexWrap="wrap"
                justifyContent="space-between"
            >
                <Card sx={{ backgroundColor: themeMode === 'dark' ? '#2a2f42' : '#f5f5f5', flex: 1, minWidth: 200 }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ color: '#ffd700', fontWeight: 'bold' }}>
                            {summary.currentBalance.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Saldo Atual
                        </Typography>
                    </CardContent>
                </Card>
                <Card sx={{ backgroundColor: themeMode === 'dark' ? '#2a2f42' : '#f5f5f5', flex: 1, minWidth: 200 }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                            +{summary.totalEarned.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Total Ganho
                        </Typography>
                    </CardContent>
                </Card>
                <Card sx={{ backgroundColor: themeMode === 'dark' ? '#2a2f42' : '#f5f5f5', flex: 1, minWidth: 200 }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ color: '#f44336', fontWeight: 'bold' }}>
                            -{summary.totalSpent.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Total Gasto
                        </Typography>
                    </CardContent>
                </Card>
                <Card sx={{ backgroundColor: themeMode === 'dark' ? '#2a2f42' : '#f5f5f5', flex: 1, minWidth: 200 }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ color: '#2196f3', fontWeight: 'bold' }}>
                            +{summary.earnedToday.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Ganho Hoje
                        </Typography>
                    </CardContent>
                </Card>
            </Stack>

            {/* Ganhos por Categoria */}
            <Paper sx={{ p: 2, mb: 3, backgroundColor: themeMode === 'dark' ? '#23283a' : '#fff' }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                    📊 Ganhos por Categoria
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {Object.entries(earningsBreakdown).map(([reason, data]: [string, any]) => (
                        <Chip
                            key={reason}
                            label={`${getReasonLabel(reason)}: +${data.total} (${data.count}x)`}
                            sx={{
                                backgroundColor: getCategoryColor(reason),
                                color: '#fff',
                                fontWeight: 'bold',
                                minWidth: 200
                            }}
                        />
                    ))}
                </Box>
            </Paper>

            {/* Transações Recentes */}
            <Paper sx={{ p: 2, mb: 3, backgroundColor: themeMode === 'dark' ? '#23283a' : '#fff' }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                    🕐 Transações Recentes
                </Typography>
                <List>
                    {recentTransactions.map((transaction: any, index: number) => (
                        <React.Fragment key={transaction._id || index}>
                            <ListItem>
                                <ListItemIcon>
                                    <Typography sx={{ fontSize: '1.5rem' }}>
                                        {transaction.type === 'earn' ? '💰' : '💸'}
                                    </Typography>
                                </ListItemIcon>
                                <ListItemText
                                    primary={
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                            <Typography variant="body1" fontWeight="bold">
                                                {getReasonLabel(transaction.reason)}
                                            </Typography>
                                            <Chip
                                                label={`${transaction.type === 'earn' ? '+' : '-'}${transaction.amount}`}
                                                size="small"
                                                sx={{
                                                    backgroundColor: transaction.type === 'earn' ? '#4caf50' : '#f44336',
                                                    color: '#fff',
                                                    fontWeight: 'bold'
                                                }}
                                            />
                                        </Box>
                                    }
                                    secondary={
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                {formatDateTime(transaction.createdAt)}
                                            </Typography>
                                            {transaction.description && (
                                                <Typography variant="caption" display="block" color="text.secondary">
                                                    {transaction.description}
                                                </Typography>
                                            )}
                                        </Box>
                                    }
                                />
                            </ListItem>
                            {index < recentTransactions.length - 1 && <Divider />}
                        </React.Fragment>
                    ))}
                </List>
            </Paper>

            {/* Histórico por Data */}
            <Paper sx={{ backgroundColor: themeMode === 'dark' ? '#23283a' : '#fff' }}>
                <Typography 
                    variant="h6" 
                    sx={{ 
                        p: 2, 
                        color: 'primary.main', 
                        fontWeight: 'bold' 
                    }}
                >
                    📅 Histórico Completo
                </Typography>
                {Object.entries(transactionsByDate)
                    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                    .map(([date, transactions]: [string, any]) => (
                        <Accordion key={date}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Box display="flex" justifyContent="space-between" width="100%" mr={2}>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        {formatDate(date)}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {transactions.length} transaç{transactions.length === 1 ? 'ão' : 'ões'}
                                    </Typography>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>
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