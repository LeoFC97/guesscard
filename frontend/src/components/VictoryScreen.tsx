import React from 'react';
import { Box, Typography, Button } from '@mui/material';

interface VictoryScreenProps {
  onRestart: () => void;
  attempts: number;
  timeSpent: number;
  cardName: string;
  cardImage: string;
}

const VictoryScreen: React.FC<VictoryScreenProps> = ({ onRestart, attempts, timeSpent, cardName, cardImage }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #81c784 0%, #388e3c 100%)',
        animation: 'fadeIn 1s',
      }}
    >
      <Typography variant="h2" color="white" gutterBottom sx={{ animation: 'pop 0.7s' }}>
        Parabéns!
      </Typography>
      <Typography variant="h5" color="white" gutterBottom>
        Você acertou a carta!
      </Typography>
      <Box sx={{ mt: 3, mb: 2, p: 2, bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2 }}>
        <Typography variant="body1" color="white">
          <strong>Tentativas:</strong> {attempts}
        </Typography>
        <Typography variant="body1" color="white">
          <strong>Tempo:</strong> {timeSpent} segundos
        </Typography>
      </Box>
      <Box sx={{ mt: 2, mb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img src={cardImage} alt={cardName} style={{ maxWidth: 220, borderRadius: 8, boxShadow: '0 2px 12px #222' }} />
        <Typography variant="h6" color="white" sx={{ mt: 1 }}>{cardName}</Typography>
      </Box>
      <Button variant="contained" color="primary" onClick={onRestart} sx={{ mt: 4 }}>
        Jogar Novamente
      </Button>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes pop {
            0% { transform: scale(0.7); }
            70% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
        `}
      </style>
    </Box>
  );
};

export default VictoryScreen;
