import React, { useState } from 'react';
import { guessCard } from '../services/mtgApi';
import { Box, TextField, Button, Stack } from '@mui/material';

export function CardGuess({ onGuess, gameId }: { onGuess: (result: any) => void, gameId: string | null }) {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!gameId) {
            alert('Jogo não iniciado.');
            return;
        }
        setLoading(true);
        try {
            const data = await guessCard(input, gameId);
            onGuess(data);
            setInput('');
        } catch (err) {
            alert('Erro ao consultar a API');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} mb={6}>
            <Stack direction="row" spacing={2}>
                <TextField
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Nome da carta"
                    disabled={loading}
                    size="medium"
                    fullWidth
                    variant="outlined"
                />
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    size="large"
                >
                    {loading ? 'Enviando...' : 'Enviar'}
                </Button>
            </Stack>
        </Box>
    );
}