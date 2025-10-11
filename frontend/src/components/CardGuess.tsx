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
        <Box 
            component="form" 
            onSubmit={handleSubmit} 
            mb={{ xs: 3, sm: 4, md: 6 }}
            px={{ xs: 1, sm: 0 }}
        >
            <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={{ xs: 1.5, sm: 2 }}
                alignItems={{ xs: 'stretch', sm: 'center' }}
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
                            size={window.innerWidth < 600 ? "small" : "medium"}
                            variant="outlined"
                            sx={{ 
                                '& .MuiInputBase-root': { 
                                    fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' },
                                    padding: { xs: '8px 12px', sm: '14px' }
                                },
                                '& .MuiInputLabel-root': {
                                    fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' }
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
                    size={window.innerWidth < 600 ? "medium" : "large"}
                    sx={{ 
                        minWidth: { xs: '100%', sm: 120, md: 140 },
                        fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' },
                        padding: { xs: '10px 20px', sm: '12px 24px', md: '10px 22px' },
                        fontWeight: 600,
                        whiteSpace: 'nowrap'
                    }}
                >
                    {loading ? 'Enviando...' : 'Enviar'}
                </Button>
            </Stack>
        </Box>
    );
}