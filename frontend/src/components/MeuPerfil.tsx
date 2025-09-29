import React from 'react';
import { Box, Typography, Divider, Chip, List, ListItem, ListItemText, Stack } from '@mui/material';

interface PerfilProps {
  userId: string;
  name: string;
  email: string;
  dailyDates: string[];
  themeMode?: 'light' | 'dark';
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

const MeuPerfil: React.FC<PerfilProps> = ({ userId, name, email, dailyDates, themeMode = 'dark', stats }) => {
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
    <Box 
      minWidth={320} 
      maxWidth={400} 
      p={3} 
      borderRadius={3} 
      bgcolor={themeMode === 'dark' ? '#23283a' : '#fff'} 
      boxShadow={4}
      sx={{
        color: themeMode === 'dark' ? '#e0e0e0' : '#23283a'
      }}
    >
      {/* DEBUG INFO */}
      <Typography variant="h5" fontWeight={700} mb={1} sx={{ color: themeMode === 'dark' ? '#a78bfa' : '#1976d2' }}>Meu Perfil</Typography>
      <Divider sx={{ mb: 2, borderColor: themeMode === 'dark' ? '#444' : '#e0e0e0' }} />
      <Typography variant="subtitle1" sx={{ color: themeMode === 'dark' ? '#e0e0e0' : '#23283a' }}><b>Nome:</b> {name || '-'}</Typography>
      <Typography variant="subtitle2" sx={{ color: themeMode === 'dark' ? '#bdbdbd' : '#555' }} mb={2}>{email || '-'}</Typography>
      <Divider sx={{ mb: 2, borderColor: themeMode === 'dark' ? '#444' : '#e0e0e0' }} />
      <Typography variant="subtitle1" fontWeight={600} sx={{ color: themeMode === 'dark' ? '#e0e0e0' : '#23283a' }}>Dias que acertou a carta do dia:</Typography>
      <Stack direction="row" flexWrap="wrap" gap={1} mb={2}>
        {dailyDates && dailyDates.length === 0 ? <Chip label="Nenhum dia ainda" color="default" /> : (dailyDates || []).map(date => (
          <Chip key={date} label={date} color="success" size="small" />
        ))}
      </Stack>
      <Divider sx={{ mb: 2, borderColor: themeMode === 'dark' ? '#444' : '#e0e0e0' }} />
      <Typography variant="subtitle1" fontWeight={600} sx={{ color: themeMode === 'dark' ? '#e0e0e0' : '#23283a' }}>Recorde pessoal</Typography>
      <List dense>
        <ListItem>
          <ListItemText 
            primary={`Menor número de tentativas: ${safeStats.bestTries}`}
            sx={{ '& .MuiListItemText-primary': { color: themeMode === 'dark' ? '#e0e0e0' : '#23283a' } }}
          />
        </ListItem>
        <ListItem>
          <ListItemText 
            primary={`Menor tempo: ${safeStats.bestTime !== '-' ? `${safeStats.bestTime}s` : '-'}`}
            sx={{ '& .MuiListItemText-primary': { color: themeMode === 'dark' ? '#e0e0e0' : '#23283a' } }}
          />
        </ListItem>
      </List>
      <Divider sx={{ mb: 2, borderColor: themeMode === 'dark' ? '#444' : '#e0e0e0' }} />
      <Typography variant="subtitle1" fontWeight={600} sx={{ color: themeMode === 'dark' ? '#e0e0e0' : '#23283a' }}>Estatísticas</Typography>
      <List dense>
        <ListItem>
          <ListItemText 
            primary={`Partidas normais: ${safeStats.totalNormal}`}
            sx={{ '& .MuiListItemText-primary': { color: themeMode === 'dark' ? '#e0e0e0' : '#23283a' } }}
          />
        </ListItem>
        <ListItem>
          <ListItemText 
            primary={`Partidas diárias: ${safeStats.totalDaily}`}
            sx={{ '& .MuiListItemText-primary': { color: themeMode === 'dark' ? '#e0e0e0' : '#23283a' } }}
          />
        </ListItem>
        <ListItem>
          <ListItemText 
            primary={`Média tentativas (normal): ${safeStats.avgTriesNormal}`}
            sx={{ '& .MuiListItemText-primary': { color: themeMode === 'dark' ? '#e0e0e0' : '#23283a' } }}
          />
        </ListItem>
        <ListItem>
          <ListItemText 
            primary={`Média tempo (normal): ${safeStats.avgTimeNormal !== '-' ? `${safeStats.avgTimeNormal}s` : '-'}`}
            sx={{ '& .MuiListItemText-primary': { color: themeMode === 'dark' ? '#e0e0e0' : '#23283a' } }}
          />
        </ListItem>
        <ListItem>
          <ListItemText 
            primary={`Média tentativas (daily): ${safeStats.avgTriesDaily}`}
            sx={{ '& .MuiListItemText-primary': { color: themeMode === 'dark' ? '#e0e0e0' : '#23283a' } }}
          />
        </ListItem>
        <ListItem>
          <ListItemText 
            primary={`Média tempo (daily): ${safeStats.avgTimeDaily !== '-' ? `${safeStats.avgTimeDaily}s` : '-'}`}
            sx={{ '& .MuiListItemText-primary': { color: themeMode === 'dark' ? '#e0e0e0' : '#23283a' } }}
          />
        </ListItem>
      </List>
      <Divider sx={{ mb: 2, borderColor: themeMode === 'dark' ? '#444' : '#e0e0e0' }} />
      <Typography variant="subtitle1" fontWeight={600} sx={{ color: themeMode === 'dark' ? '#e0e0e0' : '#23283a' }}>Última carta jogada</Typography>
      <Typography variant="body2" mb={2} sx={{ color: themeMode === 'dark' ? '#e0e0e0' : '#23283a' }}>{safeStats.lastCard !== '-' ? `${safeStats.lastCard} (${safeStats.lastDate ? new Date(safeStats.lastDate).toLocaleDateString() : ''})` : '-'}</Typography>
      <Divider sx={{ mb: 2, borderColor: themeMode === 'dark' ? '#444' : '#e0e0e0' }} />
      <Typography variant="subtitle1" fontWeight={600} sx={{ color: themeMode === 'dark' ? '#e0e0e0' : '#23283a' }}>Sequencia de acertos da carta diária:</Typography>
      <Typography variant="body2" mb={2} sx={{ color: themeMode === 'dark' ? '#e0e0e0' : '#23283a' }}>{safeStats.streak}</Typography>
    </Box>
  );
};

export default MeuPerfil;
