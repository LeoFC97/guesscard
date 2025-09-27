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
    lastCard: string;
    lastDate: string;
    streak: number;
    cardsGuessed: { cardName: string; date: string }[];
  };
}

const MeuPerfil: React.FC<PerfilProps> = ({ userId, name, email, dailyDates, stats }) => {
  // DEBUG: Mostrar userId e API URL no modal
  const apiUrl = process.env.REACT_APP_API_URL;
  // Fallbacks para stats
  const safeStats = {
    totalNormal: stats?.totalNormal ?? 0,
    totalDaily: stats?.totalDaily ?? 0,
    bestTries: stats?.bestTries ?? '-',
    bestTime: typeof stats?.bestTime === 'number' ? stats.bestTime : '-',
    avgTriesNormal: stats?.avgTriesNormal ?? '-',
    avgTimeNormal: typeof stats?.avgTimeNormal === 'number' ? stats.avgTimeNormal : '-',
    avgTriesDaily: stats?.avgTriesDaily ?? '-',
    avgTimeDaily: typeof stats?.avgTimeDaily === 'number' ? stats.avgTimeDaily : '-',
    lastCard: stats?.lastCard ?? '-',
    lastDate: stats?.lastDate ?? '',
    streak: stats?.streak ?? 0,
    cardsGuessed: stats?.cardsGuessed ?? [],
  };
  return (
    <Box minWidth={320} maxWidth={400} p={3} borderRadius={3} bgcolor="#fff" boxShadow={4}>
      {/* DEBUG INFO */}
      <Box mb={2} p={1} bgcolor="#f5f5f5" borderRadius={2}>
        <Typography variant="caption" color="secondary">userId: {userId || '-'}</Typography><br />
        <Typography variant="caption" color="secondary">API URL: {apiUrl || '-'}</Typography>
      </Box>
      <Typography variant="h5" fontWeight={700} mb={1} color="primary">Meu Perfil</Typography>
      <Divider sx={{ mb: 2 }} />
      <Typography variant="subtitle1"><b>Nome:</b> {name || '-'}</Typography>
      <Typography variant="subtitle2" color="text.secondary" mb={2}>{email || '-'}</Typography>
      <Divider sx={{ mb: 2 }} />
      <Typography variant="subtitle1" fontWeight={600}>Dias que acertou a daily:</Typography>
      <Stack direction="row" flexWrap="wrap" gap={1} mb={2}>
        {dailyDates && dailyDates.length === 0 ? <Chip label="Nenhum dia ainda" color="default" /> : (dailyDates || []).map(date => (
          <Chip key={date} label={date} color="success" size="small" />
        ))}
      </Stack>
      <Divider sx={{ mb: 2 }} />
      <Typography variant="subtitle1" fontWeight={600}>Recorde pessoal</Typography>
      <List dense>
        <ListItem>
          <ListItemText primary={`Menor número de tentativas: ${safeStats.bestTries}`} />
        </ListItem>
        <ListItem>
          <ListItemText primary={`Menor tempo: ${safeStats.bestTime !== '-' ? `${safeStats.bestTime}s` : '-'}`} />
        </ListItem>
      </List>
      <Divider sx={{ mb: 2 }} />
      <Typography variant="subtitle1" fontWeight={600}>Estatísticas</Typography>
      <List dense>
        <ListItem>
          <ListItemText primary={`Partidas normais: ${safeStats.totalNormal}`} />
        </ListItem>
        <ListItem>
          <ListItemText primary={`Partidas diárias: ${safeStats.totalDaily}`} />
        </ListItem>
        <ListItem>
          <ListItemText primary={`Média tentativas (normal): ${safeStats.avgTriesNormal}`} />
        </ListItem>
        <ListItem>
          <ListItemText primary={`Média tempo (normal): ${safeStats.avgTimeNormal !== '-' ? `${safeStats.avgTimeNormal}s` : '-'}`} />
        </ListItem>
        <ListItem>
          <ListItemText primary={`Média tentativas (daily): ${safeStats.avgTriesDaily}`} />
        </ListItem>
        <ListItem>
          <ListItemText primary={`Média tempo (daily): ${safeStats.avgTimeDaily !== '-' ? `${safeStats.avgTimeDaily}s` : '-'}`} />
        </ListItem>
      </List>
      <Divider sx={{ mb: 2 }} />
      <Typography variant="subtitle1" fontWeight={600}>Última carta jogada</Typography>
      <Typography variant="body2" mb={2}>{safeStats.lastCard !== '-' ? `${safeStats.lastCard} (${safeStats.lastDate ? new Date(safeStats.lastDate).toLocaleDateString() : ''})` : '-'}</Typography>
      <Divider sx={{ mb: 2 }} />
      <Typography variant="subtitle1" fontWeight={600}>Streak (dias seguidos jogando daily)</Typography>
      <Typography variant="body2" mb={2}>{safeStats.streak}</Typography>
      <Divider sx={{ mb: 2 }} />
      <Typography variant="subtitle1" fontWeight={600}>Cartas já acertadas</Typography>
      <List dense>
        {safeStats.cardsGuessed && safeStats.cardsGuessed.length > 0 ? safeStats.cardsGuessed.map((c: any, i: number) => (
          <ListItem key={i}>
            <ListItemText primary={`${c.cardName} (${c.date ? new Date(c.date).toLocaleDateString() : '-'})`} />
          </ListItem>
        )) : <ListItem><ListItemText primary="Nenhuma carta ainda" /></ListItem>}
      </List>
    </Box>
  );
};

export default MeuPerfil;
