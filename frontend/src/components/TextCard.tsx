import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

interface TextCardProps {
    imageUrl: string;
    cardText: string;
    cardType: string;
    manaCost: number;
    cardName?: string; // Para debug ou quando acertar
    showCard?: boolean; // Se deve mostrar a carta sem censura (quando acerta)
}

const TextCard: React.FC<TextCardProps> = ({ 
    imageUrl, 
    cardText,
    cardType,
    manaCost,
    cardName, 
    showCard = false 
}) => {
    // Função para censurar o nome da carta no texto
    const censorCardName = (text: string, name: string): string => {
        if (!name || !text) return text;
        
        // Remove caracteres especiais do nome para criar regex mais flexível
        const cleanName = name.replace(/[^a-zA-Z0-9\s]/g, '');
        const words = cleanName.split(/\s+/).filter(word => word.length > 2); // Só palavras com mais de 2 caracteres
        
        let censoredText = text;
        words.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            const censored = '█'.repeat(word.length);
            censoredText = censoredText.replace(regex, censored);
        });
        
        return censoredText;
    };

    // Função para censurar o nome na imagem (criar overlay)
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
                {showCard ? '🎉 Carta Revelada!' : '📜 Adivinhe pela Descrição'}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start', width: '100%' }}>
                {/* Imagem da carta com nome censurado */}
                <Box
                    sx={{
                        position: 'relative',
                        borderRadius: 3,
                        overflow: 'hidden',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                        flexShrink: 0,
                        width: '250px'
                    }}
                >
                    <img
                        src={imageUrl}
                        alt={showCard ? cardName : "Carta misteriosa"}
                        style={{
                            width: '100%',
                            height: 'auto',
                            display: 'block',
                        }}
                    />
                    
                    {/* Overlay para censurar o nome na imagem */}
                    {!showCard && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 12,
                                left: 12,
                                right: 12,
                                height: 24,
                                background: 'linear-gradient(45deg, #333 25%, #555 25%, #555 50%, #333 50%, #333 75%, #555 75%)',
                                backgroundSize: '8px 8px',
                                border: '2px solid #000',
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Typography variant="caption" sx={{ color: '#fff', fontWeight: 'bold' }}>
                                NOME CENSURADO
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* Informações da carta */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    {/* Custo de Mana */}
                    <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
                        <Typography variant="subtitle2" color="primary" gutterBottom>
                            💎 Custo de Mana
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                            {manaCost}
                        </Typography>
                    </Paper>

                    {/* Tipo da Carta */}
                    <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
                        <Typography variant="subtitle2" color="primary" gutterBottom>
                            🏷️ Tipo
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            {cardType}
                        </Typography>
                    </Paper>

                    {/* Texto da Carta */}
                    <Paper sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
                        <Typography variant="subtitle2" color="primary" gutterBottom>
                            📖 Texto da Carta
                        </Typography>
                        <Typography 
                            variant="body2" 
                            sx={{ 
                                lineHeight: 1.6,
                                fontFamily: 'monospace',
                                backgroundColor: showCard ? 'transparent' : '#fff3cd',
                                padding: 1,
                                borderRadius: 1,
                                border: showCard ? 'none' : '1px solid #ffeaa7'
                            }}
                        >
                            {displayText || 'Esta carta não possui texto de habilidade.'}
                        </Typography>
                    </Paper>
                </Box>
            </Box>

            {showCard && cardName && (
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ color: 'success.main', fontWeight: 'bold', mb: 1 }}>
                        {cardName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Parabéns! Você adivinhou baseado no texto da carta! 🎉
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default TextCard;