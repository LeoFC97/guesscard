import React from 'react';
import { IconButton, Tooltip, Box } from '@mui/material';
import { useLocale } from '../contexts/LocaleContext';
import { t } from '../utils/translate';

interface Props {
  /** When `inline`, render as a small inline button (used in the new app header). */
  inline?: boolean;
}

const LanguageToggle: React.FC<Props> = ({ inline = false }) => {
  const { locale, setLocale } = useLocale();
  const next = locale === 'pt' ? 'en' : 'pt';
  const tooltip = locale === 'pt' ? t('global.switchToEnglish', locale) : t('global.switchToPortuguese', locale);

  if (inline) {
    return (
      <Tooltip title={tooltip}>
        <button
          type="button"
          onClick={() => setLocale(next as 'pt' | 'en')}
          className="gc-icon-btn"
          aria-label={tooltip}
        >
          <span style={{ fontSize: 18 }}>{locale === 'pt' ? '🇧🇷' : '🇺🇸'}</span>
        </button>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={tooltip}>
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
