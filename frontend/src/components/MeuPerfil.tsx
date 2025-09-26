import React from 'react';
import { Box, Typography, Divider, Chip, List, ListItem, ListItemText, Stack } from '@mui/material';

interface PerfilProps {
  userId: string;
  name: string;
  email: string;
  dailyDates: string[];
  stats: {
    totalNormal: number;
    totalDaily: number;
    bestTries: number;
    bestTime: number;
    avgTriesNormal: number;
    avgTimeNormal: number;
    avgTriesDaily: number;
    avgTimeDaily: number;
  };
}

const MeuPerfil: React.FC<PerfilProps> = ({ userId, name, email, dailyDates, stats }) => {
  return (
    <Box minWidth={320} maxWidth={400} p={3} borderRadius={3} bgcolor="#fff" boxShadow={4}>
      <Typography variant="h5" fontWeight={700} mb={1} color="primary">Meu Perfil</Typography>
      <Divider sx={{ mb: 2 }} />
      <Typography variant="subtitle1"><b>Nome:</b> {name}</Typography>
      <Typography variant="subtitle2" color="text.secondary" mb={2}>{email}</Typography>
      <Divider sx={{ mb: 2 }} />
      <Typography variant="subtitle1" fontWeight={600}>Dias que acertou a daily:</Typography>
      <Stack direction="row" flexWrap="wrap" gap={1} mb={2}>
        {dailyDates.length === 0 ? <Chip label="Nenhum dia ainda" color="default" /> : dailyDates.map(date => (
          <Chip key={date} label={date} color="success" size="small" />
        ))}
      </Stack>
      <Divider sx={{ mb: 2 }} />
      <Typography variant="subtitle1" fontWeight={600}>Recorde pessoal</Typography>
      <List dense>
        <ListItem>
          <ListItemText primary={`Menor número de tentativas: ${stats.bestTries || '-'} `} />
        </ListItem>
        <ListItem>
          <ListItemText primary={`Menor tempo: ${stats.bestTime ? stats.bestTime + 's' : '-'}`} />
        </ListItem>
      </List>
      <Divider sx={{ mb: 2 }} />
      <Typography variant="subtitle1" fontWeight={600}>Estatísticas</Typography>
      <List dense>
        <ListItem>
          <ListItemText primary={`Partidas normais: ${stats.totalNormal}`} />
        </ListItem>
        <ListItem>
          <ListItemText primary={`Partidas diárias: ${stats.totalDaily}`} />
        </ListItem>
        <ListItem>
          <ListItemText primary={`Média tentativas (normal): ${stats.avgTriesNormal || '-'}`} />
        </ListItem>
        <ListItem>
          <ListItemText primary={`Média tempo (normal): ${stats.avgTimeNormal ? stats.avgTimeNormal + 's' : '-'}`} />
        </ListItem>
        <ListItem>
          <ListItemText primary={`Média tentativas (daily): ${stats.avgTriesDaily || '-'}`} />
        </ListItem>
        <ListItem>
          <ListItemText primary={`Média tempo (daily): ${stats.avgTimeDaily ? stats.avgTimeDaily + 's' : '-'}`} />
        </ListItem>
      </List>
    </Box>
  );
};

export default MeuPerfil;
