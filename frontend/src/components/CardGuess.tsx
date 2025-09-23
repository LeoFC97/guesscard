import React, { useState } from 'react';
import { guessCard } from '../services/mtgApi';
import { fetchCardNames } from '../services/mtgAutocomplete';
import { Box, Button, Stack, Autocomplete, TextField } from '@mui/material';

export function CardGuess({ onGuess, gameId }: { onGuess: (result: any) => void, gameId: string | null }) {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState<string[]>([]);
    const [fetching, setFetching] = useState(false);

    const handleInputChange = async (_: any, value: string) => {
        setInput(value);
        if (value.length >= 3) {
            setFetching(true);
            const names = await fetchCardNames(value);
            setOptions(names);
            setFetching(false);
        } else {
            setOptions([]);
        }
    };

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
                <Autocomplete
                    freeSolo
                    options={options}
                    inputValue={input}
                    onInputChange={handleInputChange}
                    loading={fetching}
                    fullWidth
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            placeholder="Nome da carta"
                            disabled={loading}
                            size="medium"
                            variant="outlined"
                        />
                    )}
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