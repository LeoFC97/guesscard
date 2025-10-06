import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Button, 
    Typography, 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions,
    CircularProgress,
    Card,
    CardContent,
    Chip,
    Alert,
    LinearProgress,
    Fade,
    Zoom
} from '@mui/material';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { useCoins } from '../contexts/CoinsContext';

interface AdComponentProps {
    userId: string;
    themeMode?: 'light' | 'dark';
    onAdWatched?: (reward: number) => void;
    disabled?: boolean;
}

interface AdAvailability {
    adType: string;
    available: boolean;
    reward: number;
    cooldownRemaining: number;
    dailyRemaining: number;
}

interface AdConfig {
    adTypes: Record<string, {
        reward: number;
        description: string;
        maxPerDay: number;
    }>;
}

const AdComponent: React.FC<AdComponentProps> = ({ 
    userId, 
    themeMode = 'dark', 
    onAdWatched,
    disabled = false 
}) => {
    const [availability, setAvailability] = useState<AdAvailability[]>([]);
    const [config, setConfig] = useState<AdConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [watchingAd, setWatchingAd] = useState(false);
    const [selectedAdType, setSelectedAdType] = useState<string | null>(null);
    const [adProgress, setAdProgress] = useState(0);
    const [showReward, setShowReward] = useState(false);
    const [lastReward, setLastReward] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const { refreshBalance, animateCoinsGain } = useCoins();

    // Buscar disponibilidade de anúncios
    const fetchAvailability = async () => {
        if (!userId || userId === 'guest') return;

        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/ads/availability/${userId}`);
            const data = await response.json();

            if (data.success) {
                setAvailability(data.availability);
            } else {
                setError('Erro ao carregar anúncios');
            }
        } catch (error) {
            console.error('Erro ao buscar anúncios:', error);
            setError('Erro ao carregar anúncios');
        } finally {
            setLoading(false);
        }
    };

    // Buscar configuração de anúncios
    const fetchConfig = async () => {
        try {
            const response = await fetch('/api/ads/config');
            const data = await response.json();
            
            if (data.success) {
                setConfig(data.config);
            }
        } catch (error) {
            console.error('Erro ao buscar configuração de anúncios:', error);
        }
    };

    useEffect(() => {
        fetchAvailability();
        fetchConfig();
        
        // Atualizar disponibilidade a cada 30 segundos
        const interval = setInterval(fetchAvailability, 30000);
        return () => clearInterval(interval);
    }, [userId]);

    // Simular assistir anúncio
    const watchAd = async (adType: string) => {
        if (disabled || watchingAd) return;

        setSelectedAdType(adType);
        setWatchingAd(true);
        setAdProgress(0);
        setError(null);

        try {
            // Simular duração do anúncio (15-30 segundos)
            const adDuration = adType === 'rewarded_video' ? 30 : adType === 'interstitial' ? 15 : 5;
            
            // Animação de progresso
            const progressInterval = setInterval(() => {
                setAdProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(progressInterval);
                        return 100;
                    }
                    return prev + (100 / (adDuration * 10)); // Atualizar a cada 100ms
                });
            }, 100);

            // Aguardar duração do anúncio
            await new Promise(resolve => setTimeout(resolve, adDuration * 1000));

            // Registrar visualização no backend
            const response = await fetch('/api/ads/watch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    adType,
                    viewDuration: adDuration,
                    adId: `ad_${Date.now()}`,
                    clientTimestamp: Date.now()
                }),
            });

            const data = await response.json();

            if (data.success && data.reward) {
                setLastReward(data.reward.totalReward);
                setShowReward(true);
                
                // Animar ganho de moedas
                animateCoinsGain({
                    coinsEarned: data.reward.totalReward,
                    rewardType: `ad_${adType}`,
                    newBalance: data.newBalance,
                    rewardDescription: `Anúncio assistido`
                });

                // Atualizar saldo
                await refreshBalance();

                // Callback para componente pai
                onAdWatched?.(data.reward.totalReward);

                // Atualizar disponibilidade
                setTimeout(fetchAvailability, 1000);

            } else {
                setError(data.message || 'Erro ao processar anúncio');
            }

        } catch (error) {
            console.error('Erro ao assistir anúncio:', error);
            setError('Erro ao processar anúncio');
        } finally {
            setWatchingAd(false);
            setAdProgress(0);
            setSelectedAdType(null);
        }
    };

    // Formatar tempo de cooldown
    const formatCooldown = (seconds: number): string => {
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
    };

    // Se for usuário guest
    if (!userId || userId === 'guest') {
        return null;
    }

    if (loading) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                <CircularProgress size={20} />
                <Typography variant="body2" color="text.secondary">
                    Carregando anúncios...
                </Typography>
            </Box>
        );
    }

    const availableAds = availability.filter(ad => ad.available);

    return (
        <Box>
            {/* Lista de Anúncios Disponíveis */}
            {availableAds.length > 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {availableAds.map((ad) => (
                        <Card 
                            key={ad.adType}
                            sx={{
                                backgroundColor: themeMode === 'dark' ? '#2a2f42' : '#f8f9fa',
                                border: '2px solid #ffd700',
                                borderRadius: 3,
                                cursor: disabled ? 'not-allowed' : 'pointer',
                                opacity: disabled ? 0.6 : 1,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: disabled ? 'none' : 'translateY(-2px)',
                                    boxShadow: disabled ? 'none' : '0 8px 25px rgba(255, 215, 0, 0.3)'
                                }
                            }}
                            onClick={() => !disabled && watchAd(ad.adType)}
                        >
                            <CardContent sx={{ p: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <PlayCircleFilledIcon sx={{ color: '#ffd700', fontSize: '2rem' }} />
                                        <Box>
                                            <Typography variant="body1" fontWeight="bold">
                                                {config?.adTypes[ad.adType]?.description || 'Assistir Anúncio'}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {ad.dailyRemaining} restantes hoje
                                            </Typography>
                                        </Box>
                                    </Box>
                                    
                                    <Chip
                                        icon={<MonetizationOnIcon />}
                                        label={`+${ad.reward} moedas`}
                                        sx={{
                                            backgroundColor: '#ffd700',
                                            color: '#000',
                                            fontWeight: 'bold'
                                        }}
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            )}

            {/* Anúncios em Cooldown */}
            {availability.filter(ad => !ad.available && ad.cooldownRemaining > 0).map((ad) => (
                <Card 
                    key={`cooldown_${ad.adType}`}
                    sx={{
                        backgroundColor: themeMode === 'dark' ? '#2a2f42' : '#f8f9fa',
                        opacity: 0.5,
                        mt: 1
                    }}
                >
                    <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">
                                {config?.adTypes[ad.adType]?.description || 'Anúncio'}
                            </Typography>
                            <Chip
                                label={`Disponível em ${formatCooldown(ad.cooldownRemaining)}`}
                                size="small"
                                sx={{ backgroundColor: '#666', color: '#fff' }}
                            />
                        </Box>
                    </CardContent>
                </Card>
            ))}

            {/* Mensagem quando não há anúncios */}
            {availableAds.length === 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                        Nenhum anúncio disponível no momento. Tente novamente em alguns minutos.
                    </Typography>
                </Alert>
            )}

            {/* Modal do Anúncio */}
            <Dialog 
                open={watchingAd} 
                maxWidth="sm" 
                fullWidth
                disableEscapeKeyDown
                PaperProps={{
                    sx: {
                        backgroundColor: themeMode === 'dark' ? '#23283a' : '#fff',
                        borderRadius: 3
                    }
                }}
            >
                <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
                    <Typography variant="h5" fontWeight="bold">
                        📺 Assistindo Anúncio
                    </Typography>
                </DialogTitle>
                
                <DialogContent sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="body1" sx={{ mb: 3 }}>
                        Aguarde enquanto o anúncio é reproduzido...
                    </Typography>
                    
                    <Box sx={{ width: '100%', mb: 2 }}>
                        <LinearProgress 
                            variant="determinate" 
                            value={adProgress}
                            sx={{
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: '#e0e0e0',
                                '& .MuiLinearProgress-bar': {
                                    backgroundColor: '#ffd700',
                                    borderRadius: 4
                                }
                            }}
                        />
                    </Box>
                    
                    <Typography variant="caption" color="text.secondary">
                        {Math.round(adProgress)}% concluído
                    </Typography>
                </DialogContent>
            </Dialog>

            {/* Modal de Recompensa */}
            <Dialog 
                open={showReward} 
                onClose={() => setShowReward(false)}
                maxWidth="sm"
                TransitionComponent={Zoom}
                PaperProps={{
                    sx: {
                        backgroundColor: themeMode === 'dark' ? '#23283a' : '#fff',
                        borderRadius: 3,
                        textAlign: 'center'
                    }
                }}
            >
                <DialogContent sx={{ py: 4 }}>
                    <Fade in={showReward}>
                        <Box>
                            <Typography variant="h4" sx={{ mb: 2 }}>
                                🎉
                            </Typography>
                            
                            <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
                                Parabéns!
                            </Typography>
                            
                            <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
                                Você ganhou {lastReward} moedas!
                            </Typography>
                            
                            <Typography variant="body2" color="text.secondary">
                                Obrigado por assistir ao anúncio
                            </Typography>
                        </Box>
                    </Fade>
                </DialogContent>
                
                <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                    <Button 
                        variant="contained" 
                        onClick={() => setShowReward(false)}
                        sx={{
                            backgroundColor: '#ffd700',
                            color: '#000',
                            fontWeight: 'bold',
                            '&:hover': {
                                backgroundColor: '#ffed4e'
                            }
                        }}
                    >
                        Continuar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Error Display */}
            {error && (
                <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}
        </Box>
    );
};

export default AdComponent;