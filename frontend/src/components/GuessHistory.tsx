import React from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';

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

export function GuessHistory({ guesses }: { guesses: any[] }) {
    // Mostra até 20 palpites
    const shownGuesses = guesses.slice(0, 20);
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
        <Box mt={8} sx={{ overflowX: 'auto', width: '100%' }}>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
                <span style={{
                    fontSize: '2rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '0.5rem',
                }}>
                    <span style={{
                        fontSize: '1.3rem',
                        fontWeight: 500,
                        display: 'block',
                        marginBottom: '0.5rem',
                    }}>Histórico de palpites</span>
                </span>
            </Box>
            <TableContainer component={Paper} sx={{ minWidth: { xs: 500, sm: 900, md: 1200 }, width: '100%', maxWidth: '100vw', boxShadow: 1, overflowX: 'auto' }}>
                <Table size="small" sx={{ width: '100%', minWidth: 900, '& td, & th': { padding: { xs: '6px', sm: '10px', md: '14px' }, fontSize: { xs: '0.8rem', sm: '0.95rem', md: '1.05rem' } } }}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Carta</TableCell>
                            <TableCell>Cor</TableCell>
                            <TableCell>Tipo</TableCell>
                            <TableCell>CMC</TableCell>
                            <TableCell>Edição</TableCell>
                            <TableCell>Raridade</TableCell>
                            <TableCell>Legalidade</TableCell>
                            <TableCell>Artista</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {shownGuesses.length > 0 ? shownGuesses.map((g, idx) => (
                            <TableRow key={idx}>
                                <TableCell style={{ fontWeight: 'bold' }}>{g.guessedCard?.name}</TableCell>
                                <TableCell>
                                    <Chip label={(g.guessedCard?.colors?.join(', ') || '-') + ' ' + getLabel(g.feedback.colors)} color={getColor(g.feedback.colors)} size="small" sx={{ px: 0.5 }} />
                                </TableCell>
                                <TableCell>
                                    <Chip label={(g.guessedCard?.type || '-') + ' ' + getLabel(g.feedback.type)} color={getColor(g.feedback.type)} size="small" sx={{ px: 0.5 }} />
                                </TableCell>
                                <TableCell>
                                    <Chip label={(g.guessedCard?.cmc ?? '-') + ' ' + getLabel(g.feedback.cmc)} color={getColor(g.feedback.cmc)} size="small" sx={{ px: 0.5 }} />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={(() => {
                                            const printings = g.guessedCard?.printings;
                                            const allSets = g.guessedCard?.allSets;
                                            if (Array.isArray(printings) && printings.length > 0 && allSets && typeof allSets === 'object') {
                                                const firstSetCode = printings[printings.length - 1];
                                                const firstSetName = allSets[firstSetCode] || firstSetCode;
                                                return firstSetName + ' ' + getLabel(g.feedback.edition);
                                            }
                                            return (g.guessedCard?.setName || '-') + ' ' + getLabel(g.feedback.edition);
                                        })()}
                                        color={getColor(g.feedback.edition)}
                                        size="small"
                                        sx={{ px: 0.5 }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip label={(g.guessedCard?.rarity || '-') + ' ' + getLabel(g.feedback.rarity)} color={getColor(g.feedback.rarity)} size="small" sx={{ px: 0.5 }} />
                                </TableCell>
                                {/* <TableCell>
                                    {renderLegalities(g.guessedCard?.legalities, g.feedback?.legalities)}
                                </TableCell> */}
                                <TableCell>
                                    <Chip label={(g.guessedCard?.artist || '-') + ' ' + getLabel(g.feedback.artist)} color={getColor(g.feedback.artist)} size="small" sx={{ px: 0.5 }} />
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ color: 'text.secondary' }}>
                                    Nenhum palpite ainda. Faça seu primeiro palpite!
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default GuessHistory;