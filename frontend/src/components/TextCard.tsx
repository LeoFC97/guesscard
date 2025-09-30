import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

interface TextCardProps {
    imageUrl: string;
    cardText: string;
    cardType: string;
    manaCost: number;
    cardName?: string; // Para debug ou quando acertar
    showCard?: boolean; // Se deve mostrar a carta sem censura (quando acerta)
    hasCensoredContent?: boolean; // Se o texto contém conteúdo censurado
}

const TextCard: React.FC<TextCardProps> = ({ 
    imageUrl, 
    cardText,
    cardType,
    manaCost,
    cardName, 
    showCard = false,
    hasCensoredContent = false
}) => {
    // Função para censurar o nome da carta no texto
    const censorCardName = (text: string, name: string): string => {
        if (!name || !text) return text;
        
        // Substituir o nome exato da carta por <card_name>
        const regex = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        return text.replace(regex, '<card_name>');
    };

    // O texto já vem censurado do backend quando não showCard
    // Aplica censura local para substituir por <card_name> se necessário
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
                    
                    {/* Overlays para censurar informações na imagem */}
                    {!showCard && (
                        <>
                            {/* Overlay no nome da carta (topo) */}
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

                            {/* Blur overlay sobre toda a área de texto da carta */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    bottom: 40, // Posição aproximada onde fica o texto de habilidades
                                    left: 12,
                                    right: 12,
                                    height: 100,
                                    backdropFilter: 'blur(8px)',
                                    borderRadius: 1
                                }}
                            />
                        </>
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
                            📖 Texto da Carta {!showCard && '(Censurado)'}
                        </Typography>
                        
                        {!showCard && hasCensoredContent && (
                            <Box sx={{ mb: 1, p: 1, backgroundColor: '#ffecb3', borderRadius: 1, border: '1px solid #ffc107' }}>
                                <Typography variant="caption" sx={{ color: '#e65100', fontWeight: 'bold' }}>
                                    ⚠️ Referências ao nome da carta foram censuradas com █
                                </Typography>
                            </Box>
                        )}
                        
                        <Typography 
                            variant="body2" 
                            sx={{ 
                                lineHeight: 1.6,
                                fontFamily: 'monospace',
                                backgroundColor: showCard ? 'transparent' : '#ffffff',
                                color: showCard ? 'inherit' : '#1a1a1a',
                                fontWeight: showCard ? 'normal' : 'bold',
                                padding: 1.5,
                                borderRadius: 1,
                                border: showCard ? 'none' : '2px solid #2196f3',
                                fontSize: '0.9rem',
                                whiteSpace: 'pre-wrap', // Preserva quebras de linha
                                textShadow: showCard ? 'none' : '0 0 1px rgba(0,0,0,0.1)'
                            }}
                        >
                            {displayText || 'Esta carta não possui texto de habilidade.'}
                        </Typography>
                        
                        {!showCard && (
                            <Box sx={{ mt: 1, p: 1, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
                                <Typography variant="caption" sx={{ color: '#1565c0', fontStyle: 'italic' }}>
                                    💡 Dica: Use as informações de tipo, custo de mana e habilidades para adivinhar a carta!
                                </Typography>
                            </Box>
                        )}
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