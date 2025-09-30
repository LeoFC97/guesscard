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
                top: 16,
                right: 80, // Posicionar à esquerda do botão de perfil
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
                        backgroundColor: themeMode === 'dark' ? '#2a2f42' : '#fff3cd',
                        color: '#ffd700',
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        border: `2px solid ${themeMode === 'dark' ? '#ffd700' : '#ff9800'}`,
                        cursor: loading ? 'default' : 'pointer',
                        '& .MuiChip-label': {
                            color: '#ffd700',
                            fontWeight: 'bold'
                        },
                        '& .MuiChip-icon': {
                            color: '#ffd700'
                        },
                        boxShadow: '0 2px 8px rgba(255, 215, 0, 0.2)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: loading ? 'none' : 'scale(1.05)',
                            boxShadow: loading ? '0 2px 8px rgba(255, 215, 0, 0.2)' : '0 4px 16px rgba(255, 215, 0, 0.4)',
                            backgroundColor: loading ? (themeMode === 'dark' ? '#2a2f42' : '#fff3cd') : (themeMode === 'dark' ? '#3a3f52' : '#fff8dc')
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