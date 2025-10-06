import React, { useState, useEffect } from 'react';
import { 
    Button, 
    Typography, 
    Tooltip,
    Chip,
    Box,
    CircularProgress
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AdComponent from './AdComponent';

interface AdButtonProps {
    userId: string;
    themeMode?: 'light' | 'dark';
    variant?: 'button' | 'chip' | 'compact';
    onAdWatched?: (reward: number) => void;
    disabled?: boolean;
}

const AdButton: React.FC<AdButtonProps> = ({ 
    userId, 
    themeMode = 'dark', 
    variant = 'button',
    onAdWatched,
    disabled = false 
}) => {
    const [availableAds, setAvailableAds] = useState(0);
    const [nextReward, setNextReward] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showAdModal, setShowAdModal] = useState(false);

    // Verificar anúncios disponíveis
    const checkAvailability = async () => {
        if (!userId || userId === 'guest') return;

        try {
            setLoading(true);
            const response = await fetch(`/api/ads/availability/${userId}`);
            const data = await response.json();

            if (data.success) {
                const available = data.availability.filter((ad: any) => ad.available);
                setAvailableAds(available.length);
                
                if (available.length > 0) {
                    // Pegar a maior recompensa disponível
                    const maxReward = Math.max(...available.map((ad: any) => ad.reward));
                    setNextReward(maxReward);
                }
            }
        } catch (error) {
            console.error('Erro ao verificar anúncios:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAvailability();
        
        // Verificar a cada minuto
        const interval = setInterval(checkAvailability, 60000);
        return () => clearInterval(interval);
    }, [userId]);

    const handleAdWatched = (reward: number) => {
        onAdWatched?.(reward);
        checkAvailability(); // Atualizar disponibilidade
    };

    // Se for guest ou não há anúncios disponíveis
    if (!userId || userId === 'guest' || availableAds === 0) {
        return null;
    }

    // Renderizar baseado na variante
    if (variant === 'chip') {
        return (
            <Tooltip title={`Assistir anúncio e ganhar até ${nextReward} moedas`}>
                <Chip
                    icon={loading ? <CircularProgress size={16} /> : <PlayArrowIcon />}
                    label={`+${nextReward} 🪙`}
                    onClick={() => setShowAdModal(true)}
                    disabled={disabled || loading}
                    sx={{
                        backgroundColor: '#ff6b35',
                        color: '#fff',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        '&:hover': {
                            backgroundColor: '#ff5722'
                        }
                    }}
                />
            </Tooltip>
        );
    }

    if (variant === 'compact') {
        return (
            <Box>
                <Button
                    variant="contained"
                    size="small"
                    startIcon={loading ? <CircularProgress size={16} /> : <MonetizationOnIcon />}
                    onClick={() => setShowAdModal(true)}
                    disabled={disabled || loading}
                    sx={{
                        backgroundColor: '#ff6b35',
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: '0.75rem',
                        minWidth: 'auto',
                        '&:hover': {
                            backgroundColor: '#ff5722'
                        }
                    }}
                >
                    +{nextReward}
                </Button>
                
                {/* Modal do Componente de Anúncios */}
                {showAdModal && (
                    <AdComponent
                        userId={userId}
                        themeMode={themeMode}
                        onAdWatched={(reward) => {
                            handleAdWatched(reward);
                            setShowAdModal(false);
                        }}
                    />
                )}
            </Box>
        );
    }

    // Variante padrão: button
    return (
        <Box>
            <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <PlayArrowIcon />}
                onClick={() => setShowAdModal(true)}
                disabled={disabled || loading}
                sx={{
                    backgroundColor: '#ff6b35',
                    color: '#fff',
                    fontWeight: 'bold',
                    borderRadius: 3,
                    px: 3,
                    py: 1.5,
                    boxShadow: '0 4px 15px rgba(255, 107, 53, 0.3)',
                    '&:hover': {
                        backgroundColor: '#ff5722',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(255, 107, 53, 0.4)'
                    }
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        Assistir Anúncio
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        Ganhe até {nextReward} moedas
                    </Typography>
                </Box>
            </Button>

            {/* Modal do Componente de Anúncios */}
            {showAdModal && (
                <AdComponent
                    userId={userId}
                    themeMode={themeMode}
                    onAdWatched={(reward) => {
                        handleAdWatched(reward);
                        setShowAdModal(false);
                    }}
                />
            )}
        </Box>
    );
};

export default AdButton;