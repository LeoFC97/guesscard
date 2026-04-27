import React from 'react';
import { useLocale } from '../contexts/LocaleContext';
import { t } from '../utils/translate';
import LanguageToggle from './LanguageToggle';

export type GameMode = 'classic' | 'daily' | 'text' | 'blur' | 'leaderboards';

interface Props {
  active: GameMode;
  onSelect: (mode: GameMode) => void;
  rightSlot?: React.ReactNode;
  onBrandClick?: () => void;
}

const AppShell: React.FC<React.PropsWithChildren<Props>> = ({ active, onSelect, rightSlot, onBrandClick, children }) => {
  const { locale } = useLocale();

  const tabs: { key: GameMode; label: string; icon: string }[] = [
    { key: 'classic',      label: t('shell.tabs.classic', locale),      icon: '🎴' },
    { key: 'daily',        label: t('shell.tabs.daily', locale),        icon: '📅' },
    { key: 'text',         label: t('shell.tabs.text', locale),         icon: '📜' },
    { key: 'blur',         label: t('shell.tabs.blur', locale),         icon: '🔍' },
    { key: 'leaderboards', label: t('shell.tabs.leaderboards', locale), icon: '🏆' },
  ];

  return (
    <div className="gc-shell">
      <header className="gc-header">
        <div className="gc-header-row">
          <button className="gc-brand" onClick={onBrandClick} type="button">
            <span className="gc-brand-mark">G</span>
            <span className="gc-brand-text">Guess<span className="gc-brand-accent">Card</span></span>
          </button>

          <nav className="gc-tabs" aria-label="Game modes">
            {tabs.map(tab => (
              <button
                key={tab.key}
                className={`gc-tab ${active === tab.key ? 'is-active' : ''}`}
                onClick={() => onSelect(tab.key)}
                title={tab.label}
                aria-label={tab.label}
              >
                <span className="gc-tab-icon" aria-hidden>{tab.icon}</span>
                <span className="gc-tab-label">{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className="gc-header-right">
            <LanguageToggle inline />
            {rightSlot}
          </div>
        </div>
      </header>

      <main className="gc-main">{children}</main>
    </div>
  );
};

export default AppShell;
