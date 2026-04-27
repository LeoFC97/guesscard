import React from 'react';
import { useLocale } from '../contexts/LocaleContext';
import { t } from '../utils/translate';

type Status = 'correct' | 'partial' | 'incorrect' | 'higher' | 'lower' | 'more rare' | 'less rare';

const COLOR_MAP: Record<string, 'W' | 'U' | 'B' | 'R' | 'G'> = {
  W: 'W', U: 'U', B: 'B', R: 'R', G: 'G',
  White: 'W', Blue: 'U', Black: 'B', Red: 'R', Green: 'G',
};

const tileClass = (status?: Status) => {
  if (!status) return 'gc-tile bad';
  if (status === 'correct') return 'gc-tile good';
  if (status === 'partial') return 'gc-tile partial';
  // higher/lower/more rare/less rare are signal arrows on a "wrong-but-close" red tile
  return 'gc-tile bad';
};

const arrowFor = (status?: Status): string | null => {
  if (status === 'higher' || status === 'more rare') return '▲';
  if (status === 'lower' || status === 'less rare') return '▼';
  return null;
};

const ColorPips: React.FC<{ colors?: string[] }> = ({ colors }) => {
  if (!Array.isArray(colors) || colors.length === 0) {
    return <span className="gc-pip C" title="Colorless">C</span>;
  }
  return (
    <div className="gc-color-pips">
      {colors.map((c, i) => {
        const code = COLOR_MAP[c] || (c[0] as any);
        return (
          <span key={`${code}-${i}`} className={`gc-pip ${code}`} title={c}>{code}</span>
        );
      })}
    </div>
  );
};

interface Props {
  guesses: any[];
  /** Legacy prop kept for backward compatibility — the new design is dark-only. */
  themeMode?: 'light' | 'dark';
}

const GuessHistory: React.FC<Props> = ({ guesses }) => {
  const { locale } = useLocale();
  if (!guesses || guesses.length === 0) return null;

  const headers = [
    t('history.columns.card', locale),
    t('history.columns.color', locale),
    t('history.columns.type', locale),
    t('history.columns.cmc', locale),
    t('history.columns.rarity', locale),
    t('history.columns.edition', locale),
    t('history.columns.artist', locale),
  ];

  return (
    <div className="gc-grid-wrap">
      <div className="gc-grid">
        <div className="gc-grid-header">
          {headers.map((h, i) => (
            <div key={h} className={`gc-h ${i === 0 ? 'first' : ''}`}>{h}</div>
          ))}
        </div>

        {guesses.map((g, idx) => {
          const card = g.guessedCard || {};
          const f = g.feedback || {};
          const cmcValue = card.cmc ?? card.convertedManaCost;
          const rarityValue = card.rarity || '-';
          const setValue = card.setName || '-';
          const artistValue = card.artist || '-';
          const typeValue = card.type || (Array.isArray(card.types) ? card.types[0] : '') || '-';
          const imgUrl = card.imageUrl;

          return (
            <div className="gc-row" key={`${card.name || 'guess'}-${idx}`}>
              <div className="gc-card-cell" title={card.name}>
                <div
                  className="gc-card-thumb"
                  style={imgUrl ? { backgroundImage: `url(${imgUrl})` } : undefined}
                  aria-hidden
                />
                <div className="gc-card-name">{card.name || '-'}</div>
              </div>

              <div className={tileClass(f.colors)}>
                <ColorPips colors={card.colors} />
              </div>

              <div className={tileClass(f.type)}>
                <span style={{ display: 'block', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {String(typeValue).split('—')[0].trim() || '-'}
                </span>
              </div>

              <div className={tileClass(f.cmc)}>
                <span className="gc-cmc-value">
                  {cmcValue !== undefined && cmcValue !== null ? cmcValue : '-'}
                </span>
                {arrowFor(f.cmc) && <span className="arrow">{arrowFor(f.cmc)}</span>}
              </div>

              <div className={tileClass(f.rarity)}>
                <span>{rarityValue}</span>
                {arrowFor(f.rarity) && <span className="arrow">{arrowFor(f.rarity)}</span>}
              </div>

              <div className={tileClass(f.edition)} title={setValue}>
                <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {setValue}
                </span>
              </div>

              <div className={tileClass(f.artist)} title={artistValue}>
                <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {artistValue}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GuessHistory;
export { GuessHistory };
