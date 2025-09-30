import React, { useEffect, useState } from 'react';
import { Box, Typography, Divider, Chip, List, ListItem, ListItemText, Stack } from '@mui/material';
import coinsApi, { CoinStats } from '../services/coinsApi';

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
  const [coinStats, setCoinStats] = useState<CoinStats | null>(null);
  const [loadingCoins, setLoadingCoins] = useState(true);

  // Carregar estatísticas de moedas
  useEffect(() => {
    const loadCoinStats = async () => {
      if (!userId) return;
      
      try {
        setLoadingCoins(true);
        const coinData = await coinsApi.getUserCoinStats(userId);
        setCoinStats(coinData);
      } catch (error) {
        console.error('Error loading coin stats:', error);
        // Em caso de erro, definir valores padrão
        setCoinStats({
          balance: 0,
          totalEarned: 0,
          totalSpent: 0,
          earnedToday: 0,
          spentToday: 0,
          lastUpdated: new Date()
        });
      } finally {
        setLoadingCoins(false);
      }
    };

    loadCoinStats();
  }, [userId]);

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
      
      {/* Seção de Moedas */}
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          p: 1.5,
          mb: 2,
          borderRadius: 2,
          backgroundColor: themeMode === 'dark' ? '#2a2f42' : '#f5f5f5',
          border: `2px solid ${themeMode === 'dark' ? '#ffd700' : '#ff9800'}`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" sx={{ fontSize: '1.5rem', color: '#ffd700' }}>🪙</Typography>
          <Typography variant="subtitle1" fontWeight={600} sx={{ color: themeMode === 'dark' ? '#e0e0e0' : '#23283a' }}>
            Moedas
          </Typography>
        </Box>
        <Typography 
          variant="h6" 
          fontWeight={700} 
          sx={{ 
            color: '#ffd700',
            textShadow: '0 0 8px rgba(255, 215, 0, 0.3)'
          }}
        >
          {loadingCoins ? '...' : coinStats?.balance?.toLocaleString() || '0'}
        </Typography>
      </Box>

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
      
      {/* Estatísticas detalhadas das moedas */}
      {coinStats && (
        <>
          <Divider sx={{ mb: 2, borderColor: themeMode === 'dark' ? '#444' : '#e0e0e0' }} />
          <Typography variant="subtitle1" fontWeight={600} sx={{ color: themeMode === 'dark' ? '#e0e0e0' : '#23283a' }}>Estatísticas de Moedas</Typography>
          <List dense>
            <ListItem>
              <ListItemText 
                primary={`💰 Saldo atual: ${coinStats.balance.toLocaleString()} moedas`}
                sx={{ '& .MuiListItemText-primary': { color: themeMode === 'dark' ? '#ffd700' : '#ff9800', fontWeight: 600 } }}
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary={`📈 Total ganho: ${coinStats.totalEarned.toLocaleString()}`}
                sx={{ '& .MuiListItemText-primary': { color: '#4caf50' } }}
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary={`📉 Total gasto: ${coinStats.totalSpent.toLocaleString()}`}
                sx={{ '& .MuiListItemText-primary': { color: '#f44336' } }}
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary={`🌟 Ganho hoje: ${coinStats.earnedToday.toLocaleString()}`}
                sx={{ '& .MuiListItemText-primary': { color: '#2196f3' } }}
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary={`💸 Gasto hoje: ${coinStats.spentToday.toLocaleString()}`}
                sx={{ '& .MuiListItemText-primary': { color: themeMode === 'dark' ? '#e0e0e0' : '#23283a' } }}
              />
            </ListItem>
          </List>
        </>
      )}
    </Box>
  );
};

export default MeuPerfil;
