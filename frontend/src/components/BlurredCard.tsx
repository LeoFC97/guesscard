import React from 'react';
import { Box, Typography } from '@mui/material';

interface BlurredCardProps {
    imageUrl: string;
    attempts: number;
    maxAttempts: number;
    cardName?: string; // Para debug ou quando acertar
    showCard?: boolean; // Se deve mostrar a carta sem blur (quando acerta)
    blurLevel?: number; // Nível de blur calculado pelo backend
}

const BlurredCard: React.FC<BlurredCardProps> = ({ 
    imageUrl, 
    attempts, 
    maxAttempts, 
    cardName, 
    showCard = false,
    blurLevel
}) => {
    // Calcular o nível de blur baseado nas tentativas ou usar valor do backend
    const calculateBlur = (): number => {
        if (showCard) return 0; // Sem blur quando acerta
        
        // Se o backend forneceu blurLevel, usar esse valor
        if (typeof blurLevel === 'number') {
            return blurLevel;
        }
        
        // Fallback: novo cálculo com blur inicial mais fraco e redução de 10%
        const initialBlur = 5; // Blur inicial mais fraco
        const blurReduction = 0.10; // Redução de 10% por tentativa
        const currentBlur = Math.max(0, initialBlur * Math.pow(1 - blurReduction, attempts));
        
        return currentBlur;
    };

    const blurAmount = calculateBlur();

    return (
        <Box 
            sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                mb: 3
            }}
        >
            <Typography variant="h6" gutterBottom color="primary">
                {showCard ? '🎉 Carta Revelada!' : '🔍 Adivinhe a Carta'}
            </Typography>
            
            <Box
                sx={{
                    position: 'relative',
                    borderRadius: 3,
                    overflow: 'hidden',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    transition: 'all 0.5s ease-in-out',
                }}
            >
                <img
                    src={imageUrl}
                    alt={showCard ? cardName : "Carta misteriosa"}
                    style={{
                        width: '250px',
                        height: 'auto',
                        display: 'block',
                        filter: `blur(${blurAmount}px)`,
                        transition: 'filter 0.5s ease-in-out',
                    }}
                />
                
                {/* Overlay com informações do blur */}
                {!showCard && (
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                            color: '#fff',
                            p: 1,
                            textAlign: 'center'
                        }}
                    >
                    </Box>
                )}
            </Box>

            {showCard && cardName && (
                <Typography variant="h5" sx={{ mt: 2, color: 'success.main', fontWeight: 'bold' }}>
                    {cardName}
                </Typography>
            )}
        </Box>
    );
};

export default BlurredCard;