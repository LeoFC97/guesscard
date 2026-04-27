import React, { useEffect, useState } from 'react';
import { useLocale } from '../contexts/LocaleContext';
import { t } from '../utils/translate';

interface Props {
  attempts: number;
  flavorReady: string | null;
  flavorShown: boolean;
  onFlavor: () => void;
  effectReady: string | null;
  effectShown: boolean;
  onEffect: () => void;
  /** Whether at least one guess has been processed and feedback received. */
  hasFeedback: boolean;
  flavorThreshold?: number;
  effectThreshold?: number;
}

const useIsCompact = (max = 720) => {
  const [compact, setCompact] = useState<boolean>(() =>
    typeof window !== 'undefined' && window.innerWidth <= max
  );
  useEffect(() => {
    const onResize = () => setCompact(window.innerWidth <= max);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [max]);
  return compact;
};

const HintsBar: React.FC<Props> = ({
  attempts, flavorReady, flavorShown, onFlavor,
  effectReady, effectShown, onEffect,
  hasFeedback,
  flavorThreshold = 2, effectThreshold = 5,
}) => {
  const { locale } = useLocale();
  const compact = useIsCompact();

  // Only after we have a feedback (i.e. at least one guess) can we determine that
  // a target card has no flavor / no oracle text.
  const flavorMissing = hasFeedback && !flavorReady;
  const effectMissing = hasFeedback && !effectReady;

  const flavorDisabled = flavorShown || attempts < flavorThreshold || flavorMissing || !flavorReady;
  const effectDisabled = effectShown || attempts < effectThreshold || effectMissing || !effectReady;

  const flavorLabel = (() => {
    if (flavorMissing && attempts >= flavorThreshold) return t('home.flavorUnavailable', locale);
    if (compact) {
      return flavorDisabled && !flavorShown
        ? t('home.flavorHintLockedShort', locale).replace('{{count}}', String(Math.max(0, flavorThreshold - attempts)))
        : t('home.flavorHintShort', locale);
    }
    return flavorDisabled && !flavorShown
      ? t('home.flavorHintTooltip', locale).replace('{{count}}', String(flavorThreshold))
      : t('home.showFlavorHint', locale);
  })();

  const effectLabel = (() => {
    if (effectMissing && attempts >= effectThreshold) return t('home.effectUnavailable', locale);
    if (compact) {
      return effectDisabled && !effectShown
        ? t('home.effectHintLockedShort', locale).replace('{{count}}', String(Math.max(0, effectThreshold - attempts)))
        : t('home.effectHintShort', locale);
    }
    return effectDisabled && !effectShown
      ? t('home.effectHintTooltip', locale).replace('{{count}}', String(effectThreshold))
      : t('home.showEffectHint', locale);
  })();

  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', margin: '0 auto 16px' }}>
      <button className="gc-btn gc-btn-ghost" onClick={onFlavor} disabled={flavorDisabled}>
        {flavorLabel}
      </button>
      <button className="gc-btn gc-btn-ghost" onClick={onEffect} disabled={effectDisabled}>
        {effectLabel}
      </button>
    </div>
  );
};

export default HintsBar;
