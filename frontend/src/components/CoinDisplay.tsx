import React, { useEffect, useState } from 'react';
import { Tooltip, CircularProgress } from '@mui/material';
import coinsApi, { UserCoins } from '../services/coinsApi';
import { useCoins } from '../contexts/CoinsContext';
import { useLocale } from '../contexts/LocaleContext';
import { t } from '../utils/translate';

interface CoinDisplayProps {
    userId: string;
    onClick?: () => void;
    /** When true, render inline (for the new app header). Defaults to inline. */
    inline?: boolean;
    /** Legacy prop kept for compatibility; no longer drives styling. */
    themeMode?: 'light' | 'dark';
}

const CoinDisplay: React.FC<CoinDisplayProps> = ({ userId, onClick }) => {
    const { balance, loading, setUserId, refreshBalance, coinAnimation } = useCoins();
    const [localUserCoins, setLocalUserCoins] = useState<UserCoins | null>(null);
    const { locale } = useLocale();

    useEffect(() => {
        if (userId && userId !== 'guest') {
            setUserId(userId);
            refreshBalance();
        }
    }, [userId, setUserId, refreshBalance]);

    useEffect(() => {
        const loadUserCoins = async () => {
            if (!userId || userId === 'guest') return;
            try {
                const coinData = await coinsApi.getUserCoins(userId);
                setLocalUserCoins(coinData);
            } catch (error) {
                setLocalUserCoins({
                    userId,
                    balance: 0,
                    totalEarned: 0,
                    totalSpent: 0,
                    lastUpdated: new Date()
                });
            }
        };
        if (balance === 0 && !loading) loadUserCoins();
    }, [userId, balance, loading]);

    if (!userId || userId === 'guest') return null;

    const displayBalance = balance || localUserCoins?.balance || 0;
    const tooltip = loading
        ? t('coin.loading', locale)
        : t('coin.clickToView', locale).replace('{{balance}}', displayBalance?.toLocaleString() || '0');

    return (
        <Tooltip title={tooltip}>
            <button
                type="button"
                onClick={onClick}
                disabled={loading}
                className="gc-icon-btn"
                aria-label={tooltip}
                style={{
                    width: 'auto',
                    padding: '0 14px',
                    gap: 6,
                    height: 38,
                    borderRadius: 999,
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    color: '#e7c371',
                    borderColor: 'rgba(231,195,113,0.45)',
                    position: 'relative',
                }}
            >
                <span style={{ fontSize: '1rem' }}>🪙</span>
                {loading ? <CircularProgress size={14} sx={{ color: '#e7c371' }} /> : displayBalance.toLocaleString()}

                {coinAnimation.show && (
                    <span
                        style={{
                            position: 'absolute',
                            top: '-22px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            color: '#e7c371',
                            fontWeight: 800,
                            fontSize: '0.95rem',
                            pointerEvents: 'none',
                            animation: 'gcCoinGain 1.4s ease-out forwards',
                        }}
                    >
                        +{coinAnimation.amount}
                    </span>
                )}
                <style>
                    {`@keyframes gcCoinGain {
                        0% { opacity: 1; transform: translate(-50%, 0) scale(1); }
                        80% { opacity: 1; transform: translate(-50%, -30px) scale(1); }
                        100% { opacity: 0; transform: translate(-50%, -42px) scale(0.9); }
                    }`}
                </style>
            </button>
        </Tooltip>
    );
};

export default CoinDisplay;
