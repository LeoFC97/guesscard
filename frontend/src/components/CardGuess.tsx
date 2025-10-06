import React, { useState } from 'react';
import { guessCard } from '../services/mtgApi';
import { fetchCardNames } from '../services/mtgAutocomplete';
import { Box, Button, Stack, Autocomplete, TextField } from '@mui/material';

type CardGuessProps = {
  onGuess: (result: any) => void;
  gameId: string | null;
  userId: string;
  name: string;
  email: string;
  attempts: number;
  timeSpent: number;
};

export function CardGuess({ onGuess, gameId, userId, name, email, attempts, timeSpent }: CardGuessProps) {
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
            const data = await guessCard(input, gameId, userId, name, email, attempts, timeSpent);
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
            <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2}
                alignItems="center"
            >
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
                            sx={{ 
                                '& .MuiInputBase-root': { 
                                    fontSize: { xs: '0.875rem', sm: '1rem' } 
                                } 
                            }}
                        />
                    )}
                />
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    size="large"
                    sx={{ 
                        minWidth: { xs: '100%', sm: 120 },
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        padding: { xs: '12px 24px', sm: '10px 22px' }
                    }}
                >
                    {loading ? 'Enviando...' : 'Enviar'}
                </Button>
            </Stack>
        </Box>
    );
}