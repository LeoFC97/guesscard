import React, { useEffect, useRef } from 'react';
import { Box, Paper } from '@mui/material';

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

    useEffect(() => {
        try {
            // Inicializar o anúncio quando o componente for montado
            if (window.adsbygoogle && adRef.current) {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            }
        } catch (error) {
            console.error('Erro ao carregar anúncio:', error);
        }
    }, []);

    // Calcular tamanhos responsivos
    const getResponsiveSize = () => {
        if (adSize) {
            const [width, height] = adSize.split('x').map(Number);
            return { width: `${width}px`, height: `${height}px` };
        }
        return { width: '100%', minHeight: '90px' };
    };

    const responsiveSize = getResponsiveSize();

    return (
        <Box
            className={`ad-container ${className}`}
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                margin: 2,
                ...responsiveSize,
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
                    borderRadius: 1
                }}
            >
                <ins
                    ref={adRef}
                    className="adsbygoogle"
                    style={{
                        display: 'block',
                        height: '100%',
                        ...responsiveSize
                    }}
                    data-ad-client="ca-pub-3322168839772907"
                    data-ad-slot={adSlot}
                    data-ad-format={adFormat}
                    data-full-width-responsive="true"
                />
            </Paper>
        </Box>
    );
};

export default AdBanner;