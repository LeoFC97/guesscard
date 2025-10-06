import React, { useEffect, useState, useMemo } from 'react';
import { Box, Typography, CircularProgress, Tooltip, Chip } from '@mui/material';
import coinsApi, { UserCoins } from '../services/coinsApi';
import { useCoins } from '../contexts/CoinsContext';

interface CoinDisplayProps {
    userId: string;
    themeMode?: 'light' | 'dark';
    onClick?: () => void;
}

const CoinDisplay: React.FC<CoinDisplayProps> = ({ userId, themeMode = 'dark', onClick }) => {
    const { balance, loading, setUserId, refreshBalance, coinAnimation } = useCoins();
    const [localUserCoins, setLocalUserCoins] = useState<UserCoins | null>(null);

    // Quando o userId mudar, atualizar o contexto
    useEffect(() => {
        if (userId && userId !== 'guest') {
            setUserId(userId);
            refreshBalance();
        }
    }, [userId, setUserId, refreshBalance]);

    // Fallback para modo guest ou quando contexto ainda não carregou
    useEffect(() => {
        const loadUserCoins = async () => {
            if (!userId || userId === 'guest') {
                return;
            }

            try {
                const coinData = await coinsApi.getUserCoins(userId);
                setLocalUserCoins(coinData);
            } catch (error) {
                console.error('Error loading user coins:', error);
                // Em caso de erro, definir saldo como 0
                setLocalUserCoins({
                    userId,
                    balance: 0,
                    totalEarned: 0,
                    totalSpent: 0,
                    lastUpdated: new Date()
                });
            }
        };

        // Só carrega dados localmente se não estiver usando o contexto
        if (balance === 0 && !loading) {
            loadUserCoins();
        }
    }, [userId, balance, loading]);

    // Se for guest, não mostra nada
    if (!userId || userId === 'guest') {
        return null;
    }

    // Usar saldo do contexto ou fallback local
    const displayBalance = balance || localUserCoins?.balance || 0;

    return (
        <Box 
            sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 1,
                position: 'fixed',
                top: { xs: 8, sm: 16 },
                right: { xs: 56, sm: 80 }, // Espaçamento calculado: 8px (margem) + 40px (botão) + 8px (gap) = 56px
                zIndex: 2000
            }}
        >
            <Tooltip 
                title={loading ? 'Carregando moedas...' : `Clique para ver extrato - Saldo: ${displayBalance?.toLocaleString() || '0'} moedas`}
                placement="bottom"
            >
                <Chip
                    icon={
                        loading ? 
                        <CircularProgress size={16} sx={{ color: '#ffd700' }} /> : 
                        <Typography sx={{ fontSize: '1.2rem' }}>🪙</Typography>
                    }
                    label={loading ? '...' : displayBalance?.toLocaleString() || '0'}
                    onClick={onClick}
                    clickable={!loading}
                    sx={{
                        background: themeMode === 'dark' 
                            ? 'linear-gradient(135deg, #2a2f42 0%, #353b52 50%, #2a2f42 100%)'
                            : 'linear-gradient(135deg, #fff3cd 0%, #ffebcd 50%, #fff3cd 100%)',
                        color: '#ffd700',
                        fontWeight: 'bold',
                        fontSize: { xs: '0.75rem', sm: '0.9rem' },
                        border: `2px solid ${themeMode === 'dark' ? '#ffd700' : '#ff9800'}`,
                        cursor: loading ? 'default' : 'pointer',
                        height: { xs: 32, sm: 40 },
                        borderRadius: '20px', // Formato mais orgânico, menos circular
                        minWidth: { xs: 64, sm: 84 }, // Proporção mais natural
                        width: 'auto',
                        paddingX: { xs: 1.5, sm: 2 },
                        '& .MuiChip-label': {
                            color: '#ffd700',
                            fontWeight: 'bold',
                            paddingLeft: '4px',
                            paddingRight: '8px',
                            letterSpacing: '0.5px'
                        },
                        '& .MuiChip-icon': {
                            color: '#ffd700',
                            marginLeft: '4px',
                            marginRight: '6px',
                            fontSize: { xs: '1rem', sm: '1.1rem' }
                        },
                        boxShadow: '0 3px 12px rgba(255, 215, 0, 0.25), 0 1px 4px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: 'translateZ(0)', // Otimização para hardware acceleration
                        '&:hover': {
                            transform: loading ? 'translateZ(0)' : 'translateY(-1px) scale(1.02)',
                            boxShadow: loading ? '0 3px 12px rgba(255, 215, 0, 0.25), 0 1px 4px rgba(0, 0, 0, 0.1)' : '0 6px 20px rgba(255, 215, 0, 0.35), 0 2px 8px rgba(0, 0, 0, 0.15)',
                            background: loading ? (themeMode === 'dark' 
                                ? 'linear-gradient(135deg, #2a2f42 0%, #353b52 50%, #2a2f42 100%)'
                                : 'linear-gradient(135deg, #fff3cd 0%, #ffebcd 50%, #fff3cd 100%)')
                                : (themeMode === 'dark' 
                                ? 'linear-gradient(135deg, #323856 0%, #3d4562 50%, #323856 100%)'
                                : 'linear-gradient(135deg, #fffadc 0%, #fff0cd 50%, #fffadc 100%)')
                        }
                    }}
                />
            </Tooltip>
            
            {/* Animação de moedas ganhas */}
            {coinAnimation.show && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        color: '#ffd700',
                        fontWeight: 'bold',
                        fontSize: '1.2rem',
                        animation: 'coinGain 3s ease-out forwards',
                        '@keyframes coinGain': {
                            '0%': {
                                opacity: 1,
                                transform: 'translateX(-50%) translateY(0px) scale(1.3)',
                            },
                            '30%': {
                                opacity: 1,
                                transform: 'translateX(-50%) translateY(-20px) scale(1.1)',
                            },
                            '70%': {
                                opacity: 0.8,
                                transform: 'translateX(-50%) translateY(-40px) scale(0.9)',
                            },
                            '100%': {
                                opacity: 0,
                                transform: 'translateX(-50%) translateY(-50px) scale(0.8)',
                            },
                        },
                        zIndex: 2001,
                    }}
                >
                    +{coinAnimation.amount} 🪙
                </Box>
            )}
        </Box>
    );
};

export default CoinDisplay;