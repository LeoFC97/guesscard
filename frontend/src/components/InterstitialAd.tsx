import React, { useEffect, useState } from 'react';
import { 
    Dialog, 
    DialogContent, 
    Box, 
    Typography, 
    IconButton,
    Fade,
    CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface InterstitialAdProps {
    isOpen: boolean;
    onClose: () => void;
    onAdCompleted?: () => void;
    adSlot: string; // Ad Unit ID do AdSense
    autoClose?: boolean; // Fechar automaticamente após exibir
    closeDelay?: number; // Tempo para permitir fechar (em segundos)
}

declare global {
    interface Window {
        adsbygoogle: any[];
    }
}

const InterstitialAd: React.FC<InterstitialAdProps> = ({
    isOpen,
    onClose,
    onAdCompleted,
    adSlot,
    autoClose = false,
    closeDelay = 5
}) => {
    const [loading, setLoading] = useState(true);
    const [canClose, setCanClose] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(closeDelay);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            setCanClose(false);
            setTimeRemaining(closeDelay);

            // Simular carregamento do anúncio
            const loadTimeout = setTimeout(() => {
                setLoading(false);
                
                // Inicializar anúncio do AdSense
                try {
                    if (window.adsbygoogle) {
                        (window.adsbygoogle = window.adsbygoogle || []).push({});
                    }
                } catch (error) {
                    console.error('Erro ao carregar anúncio intersticial:', error);
                }
            }, 1000);

            // Timer para permitir fechar
            const closeTimer = setTimeout(() => {
                setCanClose(true);
                onAdCompleted?.();
                
                if (autoClose) {
                    setTimeout(onClose, 1000);
                }
            }, closeDelay * 1000);

            // Countdown para mostrar quando pode fechar
            const countdownInterval = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        clearInterval(countdownInterval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => {
                clearTimeout(loadTimeout);
                clearTimeout(closeTimer);
                clearInterval(countdownInterval);
            };
        }
    }, [isOpen, closeDelay, autoClose, onAdCompleted, onClose]);

    const handleClose = () => {
        if (canClose) {
            onClose();
        }
    };

    return (
        <Dialog
            open={isOpen}
            onClose={handleClose}
            maxWidth={false}
            fullScreen
            sx={{
                '& .MuiDialog-paper': {
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }
            }}
        >
            <DialogContent sx={{ 
                position: 'relative',
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0
            }}>
                {/* Botão Fechar */}
                <Box sx={{ 
                    position: 'absolute', 
                    top: 16, 
                    right: 16, 
                    zIndex: 1000 
                }}>
                    <IconButton
                        onClick={handleClose}
                        disabled={!canClose}
                        sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            color: canClose ? '#fff' : '#666',
                            '&:hover': {
                                backgroundColor: canClose ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)'
                            }
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                    
                    {!canClose && (
                        <Typography 
                            variant="caption" 
                            sx={{ 
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                color: '#fff',
                                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                padding: '4px 8px',
                                borderRadius: 1,
                                fontSize: '0.7rem'
                            }}
                        >
                            {timeRemaining}s
                        </Typography>
                    )}
                </Box>

                {/* Área do Anúncio */}
                <Box sx={{ 
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                }}>
                    {loading ? (
                        <Fade in={loading}>
                            <Box sx={{ 
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 2,
                                color: '#fff'
                            }}>
                                <CircularProgress size={60} sx={{ color: '#fff' }} />
                                <Typography variant="h6">
                                    Carregando anúncio...
                                </Typography>
                            </Box>
                        </Fade>
                    ) : (
                        <Fade in={!loading}>
                            <Box sx={{ 
                                width: '90%',
                                maxWidth: '800px',
                                height: '80%',
                                maxHeight: '600px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#fff',
                                borderRadius: 2,
                                position: 'relative'
                            }}>
                                <ins
                                    className="adsbygoogle"
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        height: '100%',
                                        borderRadius: '8px'
                                    }}
                                    data-ad-client="ca-pub-3322168839772907"
                                    data-ad-slot={adSlot}
                                    data-ad-format="auto"
                                    data-full-width-responsive="true"
                                />
                            </Box>
                        </Fade>
                    )}
                </Box>

                {/* Indicador de Progresso */}
                {!canClose && (
                    <Box sx={{
                        position: 'absolute',
                        bottom: 24,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}>
                        <CircularProgress 
                            size={20} 
                            sx={{ color: '#fff' }}
                            variant="determinate"
                            value={(closeDelay - timeRemaining) / closeDelay * 100}
                        />
                        <Typography variant="body2">
                            Anúncio será fechável em {timeRemaining}s
                        </Typography>
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default InterstitialAd;