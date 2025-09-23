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
    const renderLegalities = (legalities?: any) => {
        if (!legalities) return '-';
        // Formatos principais
        const formats = ['pauper', 'modern', 'legacy', 'vintage', 'standard'];
        // Se vier como array de objetos [{format, legality}], transforma em objeto
        let legalitiesObj: Record<string, string> = {};
        if (Array.isArray(legalities)) {
            for (const l of legalities) {
                if (l.format && l.legality) legalitiesObj[l.format.toLowerCase()] = l.legality;
            }
        } else {
            legalitiesObj = legalities;
        }
        return (
            <Box display="flex" flexDirection="column" gap={0.5}>
                {formats.map(fmt => {
                    const status = legalitiesObj[fmt];
                    let color: 'success' | 'warning' | 'error' = 'error';
                    let label = '❌';
                    if (status === 'Legal') {
                        color = 'success';
                        label = '✔️';
                    } else if (status === 'Restricted' || status === 'Banned') {
                        color = 'error';
                        label = '❌';
                    } else if (status) {
                        color = 'warning';
                        label = '🟡';
                    }
                    return (
                        <Chip
                            key={fmt}
                            label={fmt[0].toUpperCase() + fmt.slice(1) + ': ' + (status || '-') + ' ' + label}
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
            <h2>Histórico de palpites</h2>
            <TableContainer component={Paper} sx={{ minWidth: 1100 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Carta</TableCell>
                            <TableCell>Cor</TableCell>
                            <TableCell>Tipo</TableCell>
                            <TableCell>CMC</TableCell>
                            <TableCell>Edição</TableCell>
                            <TableCell>Raridade</TableCell>
                            <TableCell>Artista</TableCell>
                            <TableCell>Legalidade</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {shownGuesses.length > 0 ? shownGuesses.map((g, idx) => (
                            <TableRow key={idx}>
                                <TableCell style={{ fontWeight: 'bold' }}>{g.guessedCard?.name}</TableCell>
                                <TableCell>
                                    <Chip label={(g.guessedCard?.colors?.join(', ') || '-') + ' ' + getLabel(g.feedback.colors)} color={getColor(g.feedback.colors)} size="small" />
                                </TableCell>
                                <TableCell>
                                    <Chip label={(g.guessedCard?.type || '-') + ' ' + getLabel(g.feedback.type)} color={getColor(g.feedback.type)} size="small" />
                                </TableCell>
                                <TableCell>
                                    <Chip label={(g.guessedCard?.cmc ?? '-') + ' ' + getLabel(g.feedback.cmc)} color={getColor(g.feedback.cmc)} size="small" />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={(() => {
                                            // Se houver printings, mostra o nome da primeira edição
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
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip label={(g.guessedCard?.rarity || '-') + ' ' + getLabel(g.feedback.rarity)} color={getColor(g.feedback.rarity)} size="small" />
                                </TableCell>
                                <TableCell>
                                    <Chip label={(g.guessedCard?.artist || '-') + ' ' + getLabel(g.feedback.artist)} color={getColor(g.feedback.artist)} size="small" />
                                </TableCell>
                                <TableCell>
                                    {renderLegalities(g.guessedCard?.legalities || g.feedback?.legalities)}
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