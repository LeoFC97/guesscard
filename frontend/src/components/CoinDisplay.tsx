import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Tooltip, Chip } from '@mui/material';
import coinsApi, { UserCoins } from '../services/coinsApi';

interface CoinDisplayProps {
    userId: string;
    themeMode?: 'light' | 'dark';
    onClick?: () => void;
}

const CoinDisplay: React.FC<CoinDisplayProps> = ({ userId, themeMode = 'dark', onClick }) => {
    const [userCoins, setUserCoins] = useState<UserCoins | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUserCoins = async () => {
            if (!userId || userId === 'guest') {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const coinData = await coinsApi.getUserCoins(userId);
                setUserCoins(coinData);
            } catch (error) {
                console.error('Error loading user coins:', error);
                // Em caso de erro, definir saldo como 0
                setUserCoins({
                    userId,
                    balance: 0,
                    totalEarned: 0,
                    totalSpent: 0,
                    lastUpdated: new Date()
                });
            } finally {
                setLoading(false);
            }
        };

        loadUserCoins();
    }, [userId]);

    // Se for guest, não mostra nada
    if (!userId || userId === 'guest') {
        return null;
    }

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
                title={loading ? 'Carregando moedas...' : `Clique para ver extrato - Saldo: ${userCoins?.balance?.toLocaleString() || '0'} moedas`}
                placement="bottom"
            >
                <Chip
                    icon={
                        loading ? 
                        <CircularProgress size={16} sx={{ color: '#ffd700' }} /> : 
                        <Typography sx={{ fontSize: '1.2rem' }}>🪙</Typography>
                    }
                    label={loading ? '...' : userCoins?.balance?.toLocaleString() || '0'}
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
        </Box>
    );
};

export default CoinDisplay;