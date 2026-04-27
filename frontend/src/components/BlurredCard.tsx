import React, { useState } from 'react';
import { useLocale } from '../contexts/LocaleContext';
import { t } from '../utils/translate';

interface BlurredCardProps {
    imageUrl: string;
    attempts: number;
    maxAttempts: number;
    cardName?: string;
    showCard?: boolean;
    blurLevel?: number;
}

const BlurredCard: React.FC<BlurredCardProps> = ({ imageUrl, attempts, cardName, showCard = false, blurLevel }) => {
    const { locale } = useLocale();
    const [loaded, setLoaded] = useState(false);

    const blurAmount = (() => {
        if (showCard) return 0;
        if (typeof blurLevel === 'number') return blurLevel;
        const initial = 5;
        return Math.max(0, initial * Math.pow(0.9, attempts));
    })();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--gc-accent)', fontWeight: 700 }}>
                {showCard ? t('blurred.revealedTitle', locale) : t('blurred.guessTitle', locale)}
            </div>
            <div
                style={{
                    position: 'relative',
                    borderRadius: 16,
                    overflow: 'hidden',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                    background: 'var(--gc-bg-1)',
                    border: '1px solid var(--gc-border)',
                    padding: 8,
                    width: 'min(360px, 86vw)',
                    aspectRatio: '5 / 7',
                }}
            >
                {/* Skeleton placeholder while the image loads */}
                {!loaded && (
                    <div
                        aria-hidden
                        style={{
                            position: 'absolute',
                            inset: 8,
                            borderRadius: 8,
                            background: 'linear-gradient(110deg, var(--gc-bg-2) 30%, var(--gc-bg-3) 50%, var(--gc-bg-2) 70%)',
                            backgroundSize: '200% 100%',
                            animation: 'gcShimmer 1.4s ease-in-out infinite',
                        }}
                    />
                )}
                <img
                    src={imageUrl}
                    alt={showCard ? cardName : t('blurred.mysteryAlt', locale)}
                    onLoad={() => setLoaded(true)}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        borderRadius: 8,
                        filter: `blur(${blurAmount}px)`,
                        transition: 'filter 480ms cubic-bezier(.2,.8,.2,1), opacity 240ms ease',
                        opacity: loaded ? 1 : 0,
                    }}
                />
            </div>
            {showCard && cardName && (
                <div style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--gc-good-strong)' }}>{cardName}</div>
            )}
        </div>
    );
};

export default BlurredCard;
