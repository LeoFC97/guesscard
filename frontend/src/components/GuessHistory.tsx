import React from 'react';
import { Box, Chip, Typography, Stack, Paper } from '@mui/material';

const getColor = (status: string) => {
    if (status === 'correct') return 'success';
    if (status === 'partial' || status === 'more rare' || status === 'less rare' || status === 'higher' || status === 'lower') return 'warning';
    return 'error';
};

const getLabel = (status: string) => {
    if (status === 'correct') return '✔️';
    if (status === 'partial') return '🟡';
    if (status === 'more rare') return '⬆️';
    if (status === 'less rare') return '⬇️';
    if (status === 'higher') return '⬆️';
    if (status === 'lower') return '⬇️';
    return '❌';
};

export function GuessHistory({ guesses, themeMode }: { guesses: any[], themeMode?: 'light' | 'dark' }) {
    // Mostra até 10 palpites (mais compacto)
    const shownGuesses = guesses.slice(0, 10);
    // Usa themeMode para cor da fonte
    const isDark = themeMode === 'dark';
    // Função para converter array de cores em iniciais
    const getColorInitials = (colors: string[] | undefined) => {
        if (!Array.isArray(colors) || colors.length === 0) return '-';
        // Magic: U=Azul, R=Vermelho, B=Preto, G=Verde, W=Branco
        const colorMap: Record<string, string> = {
            'Blue': 'U',
            'Red': 'R',
            'Black': 'B',
            'Green': 'G',
            'White': 'W',
        };
        return colors.map(c => colorMap[c] || c[0]).join(',');
    };
    // Função para mostrar legalidades principais e aplicar estratégia de parcialmente correta
    const renderLegalities = (guessedLegalities?: any, targetLegalities?: any) => {
        if (!guessedLegalities || !targetLegalities) return '-';
        const formats = ['pauper', 'modern', 'legacy', 'vintage', 'standard'];
        let guessedObj: Record<string, string> = {};
        let targetObj: Record<string, string> = {};
        if (Array.isArray(guessedLegalities)) {
            for (const l of guessedLegalities) {
                if (l.format && l.legality) guessedObj[l.format.toLowerCase()] = l.legality;
            }
        } else {
            guessedObj = guessedLegalities;
        }
        if (Array.isArray(targetLegalities)) {
            for (const l of targetLegalities) {
                if (l.format && l.legality) targetObj[l.format.toLowerCase()] = l.legality;
            }
        } else {
            targetObj = targetLegalities;
        }
        return (
            <Box display="flex" flexDirection="column" gap={0.5}>
                {formats.map(fmt => {
                    const guessed = guessedObj[fmt];
                    const target = targetObj[fmt];
                    let color: 'success' | 'warning' | 'error' = 'error';
                    let label = '❌';
                    if (target === 'Legal') {
                        color = 'success';
                        label = '✔️';
                    } else if (target === 'Restricted') {
                        color = 'warning';
                        label = '🟡';
                    } else if (target === 'Banned') {
                        color = 'error';
                        label = '❌';
                    } else {
                        color = 'error';
                        label = '❌';
                    }
                    return (
                        <Chip
                            key={fmt}
                            label={fmt[0].toUpperCase() + fmt.slice(1) + ': ' + (target || '-') + ' ' + label}
                            color={color}
                            size="small"
                            sx={{ mb: 0.5 }}
                        />
                    );
                })}
            </Box>
        );
    };
            return (
                <Box 
                    mt={{ xs: 2, sm: 3, md: 4 }} 
                    sx={{ 
                        width: '100%', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        px: { xs: 1, sm: 0 }
                    }}
                >
                    <Typography 
                        variant="h6" 
                        sx={{ 
                            mb: { xs: 1, sm: 2 }, 
                            color: 'text.secondary', 
                            fontWeight: 600,
                            fontSize: { xs: '1rem', sm: '1.25rem' },
                            textAlign: 'center'
                        }}
                    >
                        Palpites
                    </Typography>
                            
                            {/* Layout responsivo - tabela em desktop, cards em mobile */}
                            <Box sx={{ 
                                width: '100%', 
                                maxWidth: { xs: '100%', sm: 900 }, 
                                mt: { xs: 1, sm: 2 }
                            }}>
                                {/* Desktop Table */}
                                <Box sx={{ display: { xs: 'none', md: 'flex' }, overflowX: 'auto', justifyContent: 'center' }}>
                                    <table style={{ width: 'min(100%,900px)', margin: '0 auto', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                                        <thead>
                                            <tr>
                                                <th style={{ textAlign: 'left', padding: 8, fontWeight: 800, color: isDark ? '#e6e6e6' : '#1f2937', fontSize: '1rem' }}>Carta</th>
                                                <th style={{ textAlign: 'center', padding: 8 }}><span style={{ background: isDark ? '#111' : '#f0f0f0', color: isDark ? '#fff' : '#111', borderRadius: 8, padding: '4px 10px', fontWeight: 700 }}>Cor</span></th>
                                                <th style={{ textAlign: 'center', padding: 8 }}><span style={{ background: isDark ? '#111' : '#f0f0f0', color: isDark ? '#fff' : '#111', borderRadius: 8, padding: '4px 10px', fontWeight: 700 }}>Tipo</span></th>
                                                <th style={{ textAlign: 'center', padding: 8 }}><span style={{ background: isDark ? '#111' : '#f0f0f0', color: isDark ? '#fff' : '#111', borderRadius: 8, padding: '4px 10px', fontWeight: 700 }}>CMC</span></th>
                                                <th style={{ textAlign: 'center', padding: 8 }}><span style={{ background: isDark ? '#111' : '#f0f0f0', color: isDark ? '#fff' : '#111', borderRadius: 8, padding: '4px 10px', fontWeight: 700 }}>Edição</span></th>
                                                <th style={{ textAlign: 'center', padding: 8 }}><span style={{ background: isDark ? '#111' : '#f0f0f0', color: isDark ? '#fff' : '#111', borderRadius: 8, padding: '4px 10px', fontWeight: 700 }}>Raridade</span></th>
                                                <th style={{ textAlign: 'center', padding: 8 }}><span style={{ background: isDark ? '#111' : '#f0f0f0', color: isDark ? '#fff' : '#111', borderRadius: 8, padding: '4px 10px', fontWeight: 700 }}>Artista</span></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        {shownGuesses.length > 0 ? shownGuesses.map((g, idx) => (
                                                                                            <>
                                                                                                <tr key={idx}>
                                                                                                    <td style={{ fontWeight: 700, color: isDark ? '#fff' : '#111', fontSize: '0.95rem', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textShadow: isDark ? '0 2px 12px #23283a' : 'none', fontFamily: 'Montserrat, Roboto, Arial', lineHeight: '1.2', verticalAlign: 'middle' }}>{g.guessedCard?.name}</td>
                                                                                                    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                                                                        <span>
                                                                                                            {g.feedback.colors === 'correct' || g.feedback.colors === 'partial' ? (
                                                                                                                <>
                                                                                                                    <Chip label={getLabel(g.feedback.colors)} color={getColor(g.feedback.colors)} size="small" sx={{ bgcolor: getColor(g.feedback.colors) === 'success' ? '#388e3c' : getColor(g.feedback.colors) === 'warning' ? '#fbc02d' : '#c62828', color: '#fff', fontWeight: 700, mr: 1, maxWidth: 44 }} />
                                                                                                                    <span style={{ fontWeight: 800, color: isDark ? '#fff' : '#111', fontSize: '0.95rem', textShadow: isDark ? '0 1px 6px #23283a' : 'none', fontFamily: 'Montserrat, Roboto, Arial' }}>{getColorInitials(g.guessedCard?.colors)}</span>
                                                                                                                </>
                                                                                                            ) : (
                                                                                                                <Chip 
                                                                                                                    label={`${getColorInitials(g.guessedCard?.colors)} ❌`} 
                                                                                                                    color="error" 
                                                                                                                    size="small" 
                                                                                                                    sx={{ bgcolor: '#c62828', color: '#fff', fontWeight: 700, maxWidth: 120, '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }} 
                                                                                                                />
                                                                                                            )}
                                                                                                        </span>
                                                                                                    </td>
                                                                                                    <td>
                                                                                                        <span>
                                                                                                            <Chip 
                                                                                                                label={`${g.guessedCard?.type || '-'} ${getLabel(g.feedback.type)}`} 
                                                                                                                color={getColor(g.feedback.type)} 
                                                                                                                size="small" 
                                                                                                                sx={{ bgcolor: getColor(g.feedback.type) === 'success' ? '#388e3c' : getColor(g.feedback.type) === 'warning' ? '#fbc02d' : '#c62828', color: '#fff', fontWeight: 700, maxWidth: 160, '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }} 
                                                                                                            />
                                                                                                        </span>
                                                                                                    </td>
                                                                                                    <td>
                                                                                                        <span>
                                                                                                            <Chip 
                                                                                                                label={`${g.guessedCard?.cmc || 0} ${getLabel(g.feedback.cmc)}`} 
                                                                                                                color={getColor(g.feedback.cmc)} 
                                                                                                                size="small" 
                                                                                                                sx={{ bgcolor: getColor(g.feedback.cmc) === 'success' ? '#388e3c' : getColor(g.feedback.cmc) === 'warning' ? '#fbc02d' : '#c62828', color: '#fff', fontWeight: 700, maxWidth: 100, '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }} 
                                                                                                            />
                                                                                                        </span>
                                                                                                    </td>
                                                                                                    <td><span><Chip label={`${g.guessedCard?.setName || '-'} ${getLabel(g.feedback.edition)}`} color={getColor(g.feedback.edition)} size="small" sx={{ bgcolor: getColor(g.feedback.edition) === 'success' ? '#388e3c' : getColor(g.feedback.edition) === 'warning' ? '#fbc02d' : '#c62828', color: '#fff', fontWeight: 700, maxWidth: 140, '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }} /></span></td>
                                                                                                      <td>
                                                                                                            <span>
                                                                                                                <Chip 
                                                                                                                    label={`${g.guessedCard?.rarity || '-'} ${getLabel(g.feedback.rarity)}`} 
                                                                                                                    color={getColor(g.feedback.rarity)} 
                                                                                                                    size="small" 
                                                                                                                    sx={{ bgcolor: getColor(g.feedback.rarity) === 'success' ? '#388e3c' : getColor(g.feedback.rarity) === 'warning' ? '#fbc02d' : '#c62828', color: '#fff', fontWeight: 700, maxWidth: 120, '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }} 
                                                                                                                />
                                                                                                            </span>
                                                                                                        </td>
                                                                                                    <td><span><Chip label={`${g.guessedCard?.artist || '-'} ${getLabel(g.feedback.artist)}`} color={getColor(g.feedback.artist)} size="small" sx={{ bgcolor: getColor(g.feedback.artist) === 'success' ? '#388e3c' : getColor(g.feedback.artist) === 'warning' ? '#fbc02d' : '#c62828', color: '#fff', fontWeight: 700, maxWidth: 160, '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }} /></span></td>
                                                                                                </tr>
                                                                                                {idx < shownGuesses.length - 1 && (
                                                                                                    <tr aria-hidden="true" style={{ height: 8 }}>
                                                                                                        <td colSpan={7} style={{ 
                                                                                                            background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.1) 100%)', 
                                                                                                            height: 8, 
                                                                                                            padding: 0, 
                                                                                                            border: 'none',
                                                                                                            borderTop: '1px solid rgba(255,255,255,0.2)',
                                                                                                            borderBottom: '1px solid rgba(255,255,255,0.1)'
                                                                                                        }} />
                                                                                                    </tr>
                                                                                                )}
                                                                                            </>
                                        )) : (
                                            <tr>
                                                <td colSpan={7} style={{ textAlign: 'center', color: '#888', padding: 12 }}>Nenhum palpite ainda. Faça seu primeiro palpite!</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                </Box>
                                
                                {/* Mobile Cards */}
                                <Box sx={{ display: { xs: 'block', md: 'none' }, px: { xs: 1, sm: 0 } }}>
                                    <Stack spacing={{ xs: 1.5, sm: 2 }}>
                                        {shownGuesses.length > 0 ? shownGuesses.map((g, idx) => (
                                            <Paper 
                                                key={idx} 
                                                sx={{ 
                                                    p: { xs: 1.5, sm: 2 }, 
                                                    backgroundColor: isDark ? '#2a2f42' : '#f5f5f5',
                                                    border: `1px solid ${isDark ? '#444' : '#ddd'}`,
                                                    borderRadius: 2
                                                }}
                                            >
                                                <Typography 
                                                    variant="subtitle2" 
                                                    sx={{ 
                                                        fontWeight: 700, 
                                                        mb: 1,
                                                        fontSize: { xs: '0.8rem', sm: '0.9rem' },
                                                        lineHeight: 1.2,
                                                        wordBreak: 'break-word'
                                                    }}
                                                >
                                                    {g.guessedCard?.name}
                                                </Typography>
                                                <Stack 
                                                    direction="row" 
                                                    spacing={{ xs: 0.5, sm: 1 }} 
                                                    flexWrap="wrap" 
                                                    sx={{ gap: { xs: 0.5, sm: 1 } }}
                                                >
                                                    <Chip 
                                                        label={getColorInitials(g.guessedCard?.colors)} 
                                                        color={getColor(g.feedback.colors)} 
                                                        size="small" 
                                                        sx={{ 
                                                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                                            height: { xs: 24, sm: 28 }
                                                        }}
                                                    />
                                                    <Chip 
                                                        label={g.guessedCard?.types?.[0] || '-'} 
                                                        color={getColor(g.feedback.type)} 
                                                        size="small" 
                                                        sx={{ 
                                                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                                            height: { xs: 24, sm: 28 }
                                                        }}
                                                    />
                                                    <Chip 
                                                        label={g.guessedCard?.convertedManaCost || '-'} 
                                                        color={getColor(g.feedback.convertedManaCost)} 
                                                        size="small" 
                                                        sx={{ 
                                                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                                            height: { xs: 24, sm: 28 }
                                                        }}
                                                    />
                                                </Stack>
                                            </Paper>
                                        )) : (
                                            <Typography 
                                                variant="body2" 
                                                sx={{ 
                                                    textAlign: 'center', 
                                                    color: 'text.secondary',
                                                    py: 3,
                                                    fontSize: { xs: '0.8rem', sm: '0.875rem' }
                                                }}
                                            >
                                                Nenhum palpite ainda.
                                            </Typography>
                                        )}
                                    </Stack>
                                </Box>
                            </Box>
                    {/* Legenda visual dos ícones */}
                    <Stack direction="row" spacing={1} sx={{ mt: 2, mb: 2, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Ícones:</Typography>
                        <Chip label="✔️ Correto" size="small" sx={{ bgcolor: '#388e3c', color: '#fff', fontWeight: 700 }} />
                        <Chip label="🟡 Parcial" size="small" sx={{ bgcolor: '#fbc02d', color: '#fff', fontWeight: 700 }} />
                        <Chip label="❌ Incorreto" size="small" sx={{ bgcolor: '#c62828', color: '#fff', fontWeight: 700 }} />
                        <Chip label="⬆️ Maior / Mais raro" size="small" sx={{ bgcolor: '#fbc02d', color: '#fff', fontWeight: 700 }} />
                        <Chip label="⬇️ Menor / Menos raro" size="small" sx={{ bgcolor: '#fbc02d', color: '#fff', fontWeight: 700 }} />
                    </Stack>
                </Box>
            );
}

export default GuessHistory;
