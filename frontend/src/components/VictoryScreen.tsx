import React from 'react';
import { useLocale } from '../contexts/LocaleContext';
import { t } from '../utils/translate';

interface VictoryScreenProps {
  onRestart: () => void;
  attempts: number;
  timeSpent: number;
  cardName: string;
  cardImage: string;
}

const formatTime = (sec: number) => {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
};

const VictoryScreen: React.FC<VictoryScreenProps> = ({ onRestart, attempts, timeSpent, cardName, cardImage }) => {
  const { locale } = useLocale();
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: '32px 16px',
        animation: 'gcFade 360ms ease',
      }}
    >
      <div style={{ fontSize: '0.8rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gc-accent)' }}>
        {t('victory.congrats', locale)}
      </div>
      <h2 style={{ margin: 0, fontWeight: 200, fontSize: 'clamp(2rem, 4vw, 3rem)', textAlign: 'center' }}>
        {t('victory.youGuessed', locale)}
      </h2>

      {cardImage && (
        <img
          src={cardImage}
          alt={cardName}
          style={{
            maxWidth: 260,
            width: '100%',
            borderRadius: 16,
            boxShadow: '0 16px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(8,195,189,0.4)',
            animation: 'gcPop 480ms cubic-bezier(.2,.7,.3,1.4)',
          }}
        />
      )}

      <div style={{ fontWeight: 600, fontSize: '1.4rem', color: 'var(--gc-text)' }}>{cardName}</div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{
          background: 'var(--gc-bg-1)',
          border: '1px solid var(--gc-border)',
          borderRadius: 999,
          padding: '8px 18px',
          color: 'var(--gc-text)',
        }}>
          <strong style={{ color: 'var(--gc-accent)' }}>{t('victory.attempts', locale)}</strong> {attempts}
        </div>
        <div style={{
          background: 'var(--gc-bg-1)',
          border: '1px solid var(--gc-border)',
          borderRadius: 999,
          padding: '8px 18px',
          color: 'var(--gc-text)',
        }}>
          <strong style={{ color: 'var(--gc-accent)' }}>{t('victory.time', locale)}</strong> {formatTime(timeSpent)}
        </div>
      </div>

      <button className="gc-btn gc-btn-primary" onClick={onRestart} style={{ marginTop: 8 }}>
        {t('victory.playAgain', locale)}
      </button>

      <style>
        {`
          @keyframes gcFade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes gcPop  { 0% { transform: scale(0.6); opacity: 0; } 70% { transform: scale(1.05); } 100% { transform: scale(1); opacity: 1; } }
        `}
      </style>
    </div>
  );
};

export default VictoryScreen;
