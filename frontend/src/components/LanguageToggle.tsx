import React from 'react';
import { IconButton, Tooltip, Box } from '@mui/material';
import { useLocale } from '../contexts/LocaleContext';

const LanguageToggle: React.FC = () => {
  const { locale, setLocale } = useLocale();

  const next = locale === 'pt' ? 'en' : 'pt';

  return (
    <Tooltip title={locale === 'pt' ? 'Switch to English' : 'Mudar para Português'}>
      <IconButton
        color="secondary"
        onClick={() => setLocale(next as 'pt' | 'en')}
        sx={{
          position: 'fixed',
          top: { xs: 8, sm: 16 },
          left: { xs: 56, sm: 88 },
          zIndex: 2100,
          width: { xs: 40, sm: 48 },
          height: { xs: 40, sm: 48 }
        }}
      >
        <Box component="span" sx={{ fontSize: { xs: 18, sm: 20 } }}>
          {locale === 'pt' ? '🇧🇷' : '🇺🇸'}
        </Box>
      </IconButton>
    </Tooltip>
  );
};

export default LanguageToggle;
