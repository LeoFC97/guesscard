import React, { useState } from 'react';
import { CircularProgress } from '@mui/material';
import { requestHint } from '../services/mtgApi';
import { useCoins } from '../contexts/CoinsContext';
import { useLocale } from '../contexts/LocaleContext';
import { t } from '../utils/translate';

interface TextCardProps {
    cardText: string;
    cardType: string;
    manaCost: number;
    cardName?: string;
    showCard?: boolean;
    hasCensoredContent?: boolean;
    gameId?: string;
    userId?: string;
    showManaCost?: boolean;
    showCardType?: boolean;
    onHintPurchased?: () => void;
}

const TextCard: React.FC<TextCardProps> = ({
    cardText, cardType, manaCost, cardName,
    showCard = false, hasCensoredContent = false,
    gameId, userId, showManaCost = false, showCardType = false,
    onHintPurchased,
}) => {
    const [loadingMana, setLoadingMana] = useState(false);
    const [loadingType, setLoadingType] = useState(false);
    const { refreshBalance, balance } = useCoins();
    const { locale } = useLocale();

    const censorCardName = (text: string, name: string): string => {
        if (!name || !text) return text;
        const regex = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        return text.replace(regex, '█████');
    };

    const handleHint = async (which: 'mana_cost' | 'card_type') => {
        if (!gameId || !userId) return;
        const setLoading = which === 'mana_cost' ? setLoadingMana : setLoadingType;
        setLoading(true);
        try {
            await requestHint(gameId, which, userId);
            await refreshBalance();
            onHintPurchased?.();
        } catch (error) {
            alert(error instanceof Error ? error.message : t('errors.hintRequestFailed', locale));
        } finally {
            setLoading(false);
        }
    };

    const displayText = showCard ? cardText : censorCardName(cardText, cardName || '');

    return (
        <div className="gc-panel" style={{ maxWidth: 720, margin: '0 auto 24px' }}>
            <div style={{ textAlign: 'center', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--gc-accent)', fontWeight: 700, marginBottom: 16 }}>
                {showCard ? t('textcard.revealedTitle', locale) : t('textcard.guessTitle', locale)}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 16 }}>
                <HintBox
                    title={t('textcard.manaTitle', locale)}
                    revealed={showCard || showManaCost}
                    revealedValue={String(manaCost)}
                    revealLabel={t('textcard.manaReveal', locale)}
                    note={t('textcard.manaCostNote', locale)}
                    onClick={() => handleHint('mana_cost')}
                    disabled={loadingMana || balance < 10}
                    loading={loadingMana}
                />
                <HintBox
                    title={t('textcard.cardTypeTitle', locale)}
                    revealed={showCard || showCardType}
                    revealedValue={cardType}
                    revealLabel={t('textcard.cardTypeReveal', locale)}
                    note={t('textcard.manaCostNote', locale)}
                    onClick={() => handleHint('card_type')}
                    disabled={loadingType || balance < 10}
                    loading={loadingType}
                />
            </div>

            <div style={{
                background: 'var(--gc-bg-2)',
                border: '1px solid var(--gc-border)',
                borderRadius: 12,
                padding: 20,
            }}>
                <div style={{ textAlign: 'center', color: 'var(--gc-accent)', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 12 }}>
                    {t('textcard.textTitle', locale)}
                </div>
                {!showCard && hasCensoredContent && (
                    <div style={{ background: 'rgba(231,195,113,0.12)', border: '1px solid rgba(231,195,113,0.4)', color: 'var(--gc-gold)', padding: '8px 12px', borderRadius: 8, textAlign: 'center', fontSize: '0.85rem', marginBottom: 12 }}>
                        ⚠️ {t('textcard.censoredWarning', locale)}
                    </div>
                )}
                <p style={{ fontFamily: 'Georgia, serif', color: 'var(--gc-text)', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontSize: '1rem', margin: 0 }}>
                    {displayText || t('textcard.textEmpty', locale)}
                </p>
                {!showCard && (
                    <p style={{ marginTop: 12, color: 'var(--gc-text-dim)', fontStyle: 'italic', textAlign: 'center', fontSize: '0.85rem' }}>
                        {t('textcard.hintTip', locale)}
                    </p>
                )}
            </div>

            {showCard && cardName && (
                <div style={{ marginTop: 16, padding: 16, textAlign: 'center', background: 'rgba(31,159,80,0.12)', border: '1px solid rgba(31,159,80,0.4)', borderRadius: 12 }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--gc-good-strong)' }}>{cardName}</div>
                    <div style={{ color: 'var(--gc-text-dim)', marginTop: 4 }}>{t('textcard.congrats', locale)}</div>
                </div>
            )}
        </div>
    );
};

const HintBox: React.FC<{
    title: string;
    revealed: boolean;
    revealedValue: string;
    revealLabel: string;
    note: string;
    onClick: () => void;
    disabled: boolean;
    loading: boolean;
}> = ({ title, revealed, revealedValue, revealLabel, note, onClick, disabled, loading }) => (
    <div style={{
        background: 'var(--gc-bg-2)',
        border: '1px solid var(--gc-border)',
        borderRadius: 12,
        padding: 16,
        textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
    }}>
        <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--gc-accent)', fontWeight: 700 }}>{title}</div>
        {revealed ? (
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--gc-text)' }}>{revealedValue}</div>
        ) : (
            <>
                <button className="gc-btn gc-btn-primary" onClick={onClick} disabled={disabled}>
                    {loading ? <CircularProgress size={16} color="inherit" /> : revealLabel}
                </button>
                <div style={{ color: 'var(--gc-text-dim)', fontSize: '0.78rem' }}>{note}</div>
            </>
        )}
    </div>
);

export default TextCard;
