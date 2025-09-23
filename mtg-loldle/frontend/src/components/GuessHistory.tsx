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
    if (!guesses.length) return null;
    return (
    <Box mt={8} overflow="auto">
            <h2>Histórico de palpites</h2>
            <TableContainer component={Paper}>
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
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {guesses.map((g, idx) => (
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
                                    <Chip label={(g.guessedCard?.setName || '-') + ' ' + getLabel(g.feedback.edition)} color={getColor(g.feedback.edition)} size="small" />
                                </TableCell>
                                <TableCell>
                                    <Chip label={(g.guessedCard?.rarity || '-') + ' ' + getLabel(g.feedback.rarity)} color={getColor(g.feedback.rarity)} size="small" />
                                </TableCell>
                                <TableCell>
                                    <Chip label={(g.guessedCard?.artist || '-') + ' ' + getLabel(g.feedback.artist)} color={getColor(g.feedback.artist)} size="small" />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default GuessHistory;