import React, { useEffect, useRef } from 'react';
import { Box, Paper } from '@mui/material';
import { waitForAdSense } from '../utils/adDebug';

interface AdBannerProps {
    adSlot: string; // Ad Unit ID do AdSense
    adFormat?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
    adSize?: string; // Ex: "728x90", "300x250", "160x600"
    className?: string;
    style?: React.CSSProperties;
}

declare global {
    interface Window {
        adsbygoogle: any[];
    }
}

const AdBanner: React.FC<AdBannerProps> = ({
    adSlot,
    adFormat = 'auto',
    adSize,
    className = '',
    style = {}
}) => {
    const adRef = useRef<HTMLModElement>(null);
    const [adLoaded, setAdLoaded] = React.useState(false);
    const [adError, setAdError] = React.useState(false);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        
        const initializeAd = async () => {
            try {
                console.log('AdBanner: Tentando carregar anúncio com slot:', adSlot);
                
                // Aguardar o AdSense carregar
                const adSenseLoaded = await waitForAdSense(5000);
                if (!adSenseLoaded) {
                    console.error('AdBanner: AdSense não carregou dentro do timeout');
                    setAdError(true);
                    return;
                }

                if (!adRef.current) {
                    console.error('AdBanner: Elemento do anúncio não encontrado');
                    setAdError(true);
                    return;
                }

                // Verificar se o slot é válido
                if (!adSlot || adSlot.length < 5) {
                    console.error('AdBanner: ID do slot inválido:', adSlot);
                    setAdError(true);
                    return;
                }

                console.log('AdBanner: Inicializando AdSense para slot:', adSlot);
                (window.adsbygoogle = window.adsbygoogle || []).push({});
                setAdLoaded(true);
                
                // Verificar se o anúncio carregou após um tempo
                setTimeout(() => {
                    if (adRef.current && !adRef.current.innerHTML.trim()) {
                        console.warn('AdBanner: Anúncio parece não ter carregado conteúdo');
                        setAdError(true);
                    }
                }, 2000);
                
            } catch (error) {
                console.error('Erro ao carregar anúncio:', error);
                setAdError(true);
            }
        };

        // Aguardar um pouco para o DOM estar pronto
        timeoutId = setTimeout(initializeAd, 200);

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [adSlot]);

    // Calcular tamanhos responsivos
    const getResponsiveSize = () => {
        if (adSize) {
            const [width, height] = adSize.split('x').map(Number);
            return { 
                width: `${Math.min(width, 728)}px`,
                height: `${height}px`,
                minHeight: '90px'
            };
        }
        return { 
            width: '100%', 
            minHeight: '90px'
        };
    };

    const responsiveSize = getResponsiveSize();

    return (
        <Box
            className={`ad-container ${className}`}
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                margin: { xs: 1, sm: 2 },
                width: { 
                    xs: '100%', 
                    sm: responsiveSize.width === '100%' ? '100%' : responsiveSize.width 
                },
                height: responsiveSize.height,
                minHeight: responsiveSize.minHeight,
                maxWidth: { xs: '100vw', sm: '728px' },
                overflow: 'hidden',
                ...style
            }}
        >
            <Paper
                elevation={1}
                sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f5f5f5',
                    border: '1px solid #ddd',
                    borderRadius: 1,
                    position: 'relative',
                    overflow: 'hidden',
                    minHeight: { xs: '80px', sm: '90px' }
                }}
            >
                <ins
                    ref={adRef}
                    className="adsbygoogle"
                    style={{
                        display: 'block',
                        width: '100%',
                        height: '100%',
                        minHeight: '80px',
                        maxWidth: '728px'
                    }}
                    data-ad-client="ca-pub-3322168839772907"
                    data-ad-slot={adSlot}
                    data-ad-format={adFormat}
                    data-full-width-responsive="true"
                />
                
                {/* Fallback para quando o anúncio não carrega */}
                {adError && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#f0f0f0',
                            color: '#666',
                            fontSize: '0.8rem',
                            textAlign: 'center',
                            padding: 1
                        }}
                    >
                        Espaço publicitário
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default AdBanner;