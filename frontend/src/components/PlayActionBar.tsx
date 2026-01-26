import React from 'react';
import { Box, Button, Typography, IconButton } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import InfoIcon from '@mui/icons-material/Info';
import { useLocale } from '../contexts/LocaleContext';
import { t } from '../utils/translate';
import { useCoins } from '../contexts/CoinsContext';

interface PlayActionBarProps {
  onHint: () => void;
  onFlavorHint: () => void;
  hintDisabled?: boolean;
  flavorDisabled?: boolean;
  onShowLeaderboards?: () => void;
  onExit?: () => void;
  attempts?: number;
  timeSec?: number;
}

const PlayActionBar: React.FC<PlayActionBarProps> = ({
  onHint,
  onFlavorHint,
  hintDisabled = false,
  flavorDisabled = false,
  onShowLeaderboards,
  onExit,
  attempts = 0,
  timeSec = 0
}) => {
  const { locale } = useLocale();
  const { balance } = useCoins();

  return (
    <Box
      component="footer"
      aria-label={t('home.menu', locale)}
      sx={{
        position: { xs: 'fixed', sm: 'sticky' },
        bottom: 12,
        left: 12,
        right: 12,
        zIndex: 2200,
        display: 'flex',
        gap: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 1,
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(6px)',
        borderRadius: 2,
        boxShadow: 6,
        '@media (min-width:900px)': {
          left: 'auto',
          right: 24,
          width: 520
        }
      }}
    >
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>{t('home.title', locale)}</Typography>
          <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>{`${t('victory.attempts', locale)} ${attempts} • ${t('victory.time', locale)} ${timeSec}s`}</Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <Typography sx={{ fontWeight: 700, mr: 1 }}>{balance}</Typography>
        <Tooltip title={t('textcard.manaCostNote', locale)}>
          <IconButton aria-label={t('textcard.manaReveal', locale)}>
            <InfoIcon />
          </IconButton>
        </Tooltip>
        <Button variant="outlined" color="secondary" onClick={onFlavorHint} disabled={flavorDisabled} aria-disabled={flavorDisabled}>
          {t('home.showFlavorHint', locale)}
        </Button>
        <Button variant="contained" color="primary" onClick={onHint} disabled={hintDisabled} aria-disabled={hintDisabled}>
          {t('home.showEffectHint', locale)}
        </Button>
      </Box>

      <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1 }}>
        {onShowLeaderboards && (
          <Button variant="text" onClick={onShowLeaderboards}>{t('home.viewRankings', locale)}</Button>
        )}
        {onExit && (
          <Button variant="outlined" color="secondary" onClick={onExit}>{t('home.menu', locale)}</Button>
        )}
      </Box>
    </Box>
  );
};

export default PlayActionBar;
