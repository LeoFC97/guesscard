import React, { useState } from 'react';
import { Box, Typography, Paper, Button, CircularProgress } from '@mui/material';
import { requestHint } from '../services/mtgApi';
import { useCoins } from '../contexts/CoinsContext';
import { useLocale } from '../contexts/LocaleContext';
import { t } from '../utils/translate';

interface TextCardProps {
    cardText: string;
    cardType: string;
    manaCost: number;
    cardName?: string; // Para debug ou quando acertar
    showCard?: boolean; // Se deve mostrar a carta sem censura (quando acerta)
    hasCensoredContent?: boolean; // Se o texto contém conteúdo censurado
    gameId?: string; // ID do jogo para solicitar dicas
    userId?: string; // ID do usuário para cobrar moedas
    showManaCost?: boolean; // Se deve mostrar o custo de mana
    showCardType?: boolean; // Se deve mostrar o tipo da carta
    onHintPurchased?: () => void; // Callback quando uma dica é comprada
}

const TextCard: React.FC<TextCardProps> = ({ 
    cardText,
    cardType,
    manaCost,
    cardName, 
    showCard = false,
    hasCensoredContent = false,
    gameId,
    userId,
    showManaCost = false,
    showCardType = false,
    onHintPurchased
}) => {
    const [loadingManaCost, setLoadingManaCost] = useState(false);
    const [loadingCardType, setLoadingCardType] = useState(false);
    const { refreshBalance, balance } = useCoins();
    const { locale } = useLocale();

    // Função para censurar o nome da carta no texto
    const censorCardName = (text: string, name: string): string => {
        if (!name || !text) return text;
        
        // Substituir o nome exato da carta por <card_name>
        const regex = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        return text.replace(regex, '<card_name>');
    };

    // Função para solicitar dica do custo de mana
    const handleManaCostHint = async () => {
        if (!gameId || !userId || showManaCost) return;

        setLoadingManaCost(true);
        try {
            await requestHint(gameId, 'mana_cost', userId);
            await refreshBalance(); // Atualizar saldo de moedas
            onHintPurchased?.(); // Callback para atualizar o estado do jogo
        } catch (error) {
            console.error('Erro ao solicitar dica de custo de mana:', error);
            alert(error instanceof Error ? error.message : t('errors.hintRequestFailed', locale));
        } finally {
            setLoadingManaCost(false);
        }
    };

    // Função para solicitar dica do tipo da carta
    const handleCardTypeHint = async () => {
        if (!gameId || !userId || showCardType) return;

        setLoadingCardType(true);
        try {
            await requestHint(gameId, 'card_type', userId);
            await refreshBalance(); // Atualizar saldo de moedas
            onHintPurchased?.(); // Callback para atualizar o estado do jogo
        } catch (error) {
            console.error('Erro ao solicitar dica de tipo:', error);
            alert(error instanceof Error ? error.message : t('errors.hintRequestFailed', locale));
        } finally {
            setLoadingCardType(false);
        }
    };

    // O texto já vem censurado do backend quando não showCard
    // Aplica censura local para substituir por <card_name> se necessário
    const displayText = showCard ? cardText : censorCardName(cardText, cardName || '');

    return (
        <Box 
            sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                mb: 3,
                maxWidth: 600,
                mx: 'auto'
            }}
        >
            <Typography variant="h6" gutterBottom color="secondary" sx={{ fontWeight: 'bold' }}>
                {showCard ? t('textcard.revealedTitle', locale) : t('textcard.guessTitle', locale)}
            </Typography>
            
            {/* Layout centralizado apenas com informações de texto */}
            <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto' }}>
                {/* Grid responsivo para as informações */}
                <Box 
                    sx={{ 
                        display: 'grid', 
                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                        gap: 2,
                        mb: 3
                    }}
                >
                    {/* Custo de Mana */}
                    <Paper sx={{ p: { xs: 2, sm: 3 }, backgroundColor: '#f8f9fa', textAlign: 'center', borderRadius: 2, boxShadow: 2 }}>
                        <Typography variant="subtitle1" color="primary" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                            {t('textcard.manaTitle', locale)}
                        </Typography>
                        
                        {showCard || showManaCost ? (
                            <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                                {manaCost}
                            </Typography>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleManaCostHint}
                                    disabled={loadingManaCost || balance < 10}
                                    sx={{ 
                                        minWidth: 180,
                                        height: 56,
                                        fontSize: { xs: '0.875rem', sm: '1rem' },
                                        fontWeight: 'bold',
                                        textTransform: 'none',
                                        borderRadius: 2,
                                        boxShadow: 3,
                                        '&:hover': {
                                            boxShadow: 6,
                                            transform: 'translateY(-1px)'
                                        },
                                        '&.Mui-disabled': {
                                            backgroundColor: '#e0e0e0',
                                            color: '#9e9e9e'
                                        }
                                    }}
                                >
                                    {loadingManaCost ? (
                                        <CircularProgress size={24} color="inherit" />
                                    ) : (
                                        t('textcard.manaReveal', locale)
                                    )}
                                </Button>
                                <Typography 
                                    variant="body2" 
                                    sx={{ 
                                        color: balance < 10 ? '#d32f2f' : '#666666',
                                        fontWeight: balance < 10 ? 'bold' : '500',
                                        fontSize: '0.875rem',
                                        textAlign: 'center'
                                    }}
                                >
                                    {t('textcard.manaCostNote', locale)}
                                </Typography>
                            </Box>
                        )}
                    </Paper>

                    {/* Tipo da Carta */}
                    <Paper sx={{ p: { xs: 2, sm: 3 }, backgroundColor: '#f8f9fa', textAlign: 'center', borderRadius: 2, boxShadow: 2 }}>
                        <Typography variant="subtitle1" color="primary" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                            {t('textcard.cardTypeTitle', locale)}
                        </Typography>
                        
                        {showCard || showCardType ? (
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                                {cardType}
                            </Typography>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={handleCardTypeHint}
                                    disabled={loadingCardType || balance < 10}
                                    sx={{ 
                                        minWidth: 180,
                                        height: 56,
                                        fontSize: { xs: '0.875rem', sm: '1rem' },
                                        fontWeight: 'bold',
                                        textTransform: 'none',
                                        borderRadius: 2,
                                        boxShadow: 3,
                                        '&:hover': {
                                            boxShadow: 6,
                                            transform: 'translateY(-1px)'
                                        },
                                        '&.Mui-disabled': {
                                            backgroundColor: '#e0e0e0',
                                            color: '#9e9e9e'
                                        }
                                    }}
                                >
                                    {loadingCardType ? (
                                        <CircularProgress size={24} color="inherit" />
                                    ) : (
                                        t('textcard.cardTypeReveal', locale)
                                    )}
                                </Button>
                                <Typography 
                                    variant="body2" 
                                    sx={{ 
                                        color: balance < 10 ? '#d32f2f' : '#666666',
                                        fontWeight: balance < 10 ? 'bold' : '500',
                                        fontSize: '0.875rem',
                                        textAlign: 'center'
                                    }}
                                >
                                    {t('textcard.manaCostNote', locale)}
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Box>

                {/* Texto da Carta - Destaque principal */}
                <Paper 
                    sx={{ 
                        p: 4, 
                        backgroundColor: '#f9f9f9',
                        border: '3px solid #2196f3',
                        borderRadius: 2
                    }}
                >
                    <Typography variant="h6" color="primary" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
                        {t('textcard.textTitle', locale)} {!showCard}
                    </Typography>
                    
                    {!showCard && hasCensoredContent && (
                        <Box sx={{ mb: 2, p: 2, backgroundColor: '#ffecb3', borderRadius: 1, border: '1px solid #ffc107' }}>
                            <Typography variant="body2" sx={{ color: '#e65100', fontWeight: 'bold', textAlign: 'center' }}>
                                ⚠️ {t('textcard.censoredWarning', locale)}
                            </Typography>
                        </Box>
                    )}
                    
                    <Paper 
                        elevation={2}
                        sx={{ 
                            p: 3,
                            backgroundColor: showCard ? 'transparent' : '#ffffff',
                            border: '1px solid #ddd'
                        }}
                    >
                        <Typography 
                            variant="body1" 
                            sx={{ 
                                lineHeight: 1.8,
                                fontFamily: 'Georgia, serif',
                                color: showCard ? 'inherit' : '#1a1a1a',
                                fontWeight: showCard ? 'normal' : 'bold',
                                fontSize: { xs: '1rem', sm: '1.1rem' },
                                whiteSpace: 'pre-wrap',
                                textAlign: 'justify',
                                minHeight: '120px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {displayText || t('textcard.textEmpty', locale)}
                        </Typography>
                    </Paper>
                    
                    {!showCard && (
                        <Box sx={{ mt: 3, p: 2, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
                            <Typography variant="body2" sx={{ color: '#1565c0', fontStyle: 'italic', textAlign: 'center' }}>
                                {t('textcard.hintTip', locale)}
                            </Typography>
                        </Box>
                    )}
                </Paper>
            </Box>

            {showCard && cardName && (
                <Paper 
                    sx={{ 
                        mt: 4, 
                        p: 4, 
                        textAlign: 'center',
                        backgroundColor: '#e8f5e8',
                        border: '3px solid #4caf50',
                        borderRadius: 2
                    }}
                >
                    <Typography variant="h3" sx={{ color: 'success.main', fontWeight: 'bold', mb: 2 }}>
                        🎉 {cardName} 🎉
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#2e7d32', mb: 1 }}>
                        {t('textcard.congrats', locale)}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {t('textcard.completed', locale)}
                    </Typography>
                </Paper>
            )}
        </Box>
    );
};

export default TextCard;
