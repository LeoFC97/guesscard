import React, { useState } from 'react';
import { CircularProgress } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import CheckIcon from '@mui/icons-material/Check';
import { useDailyPlayedDates } from '../hooks/useDailyPlayedDates';
import { useLocale } from '../contexts/LocaleContext';
import { t } from '../utils/translate';
import type { GameMode } from './AppShell';

type Difficulty = 'easy' | 'medium' | 'hard';

interface Props {
    mode: Exclude<GameMode, 'leaderboards'>;
    userId: string;
    onGameStarted: (cardName: string, gameId: string, gameData?: any) => void;
}

const getLocalDateStr = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const isFuture = (d: Date) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return d > today;
};

const ModePicker: React.FC<Props> = ({ mode, userId, onGameStarted }) => {
    const { locale } = useLocale();
    const [difficulty, setDifficulty] = useState<Difficulty>('medium');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const playedDates = useDailyPlayedDates(userId);

    const start = async () => {
        setLoading(true); setError(null);
        try {
            if (mode === 'classic') {
                const r = await fetch(`${process.env.REACT_APP_API_URL}/api/new-game`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ difficulty }),
                });
                if (!r.ok) throw new Error(t('errors.newGame', locale));
                const d = await r.json();
                onGameStarted(d.cardName, d.gameId);
            } else if (mode === 'text') {
                const r = await fetch(`${process.env.REACT_APP_API_URL}/api/new-text-game`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ difficulty }),
                });
                if (!r.ok) throw new Error(t('errors.newTextGame', locale));
                const d = await r.json();
                onGameStarted(d.cardName, d.gameId, d);
            } else if (mode === 'blur') {
                const r = await fetch(`${process.env.REACT_APP_API_URL}/api/new-blur-game`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ difficulty }),
                });
                if (!r.ok) throw new Error(t('errors.newBlurGame', locale));
                const d = await r.json();
                onGameStarted(d.cardName, d.gameId, d);
            } else if (mode === 'daily') {
                if (isFuture(selectedDate)) {
                    setError(t('errors.futureDate', locale));
                    return;
                }
                const dateStr = getLocalDateStr(selectedDate);
                const r = await fetch(`${process.env.REACT_APP_API_URL}/api/daily-game?userId=${encodeURIComponent(userId)}&date=${dateStr}`);
                const d = await r.json();
                if (!r.ok) {
                    if (r.status === 403) setError(t('errors.dailyAlreadyPlayed', locale).replace('{{date}}', dateStr));
                    else if (r.status === 404) setError(t('errors.dailyNotDefined', locale).replace('{{date}}', dateStr));
                    else setError(d.message || t('errors.dailyStartError', locale));
                    return;
                }
                onGameStarted(d.cardName, d.gameId || `daily-${dateStr}`);
            }
        } catch (e: any) {
            setError(e.message || t('errors.connectionError', locale));
        } finally {
            setLoading(false);
        }
    };

    const titleKey = mode === 'classic' ? 'home.title'
        : mode === 'daily' ? 'start.dailyMode.title'
        : mode === 'text' ? 'start.textMode.title'
        : 'start.blurMode.title';

    const descKey = mode === 'text' ? 'start.textMode.description'
        : mode === 'blur' ? 'start.blurMode.description'
        : mode === 'daily' ? 'start.dailyMode.chooseDate'
        : 'shell.tagline';

    return (
        <div className="gc-panel" style={{ maxWidth: 560, margin: '16px auto' }}>
            <h1 className="gc-page-title" style={{ marginTop: 0 }}>
                {t(titleKey, locale)}
            </h1>
            <p className="gc-page-subtitle" style={{ marginBottom: 20 }}>
                {t(descKey, locale)}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '100%' }}>
                <div className="gc-difficulty">
                    {(['easy', 'medium', 'hard'] as const).map(d => (
                        <button key={d}
                            className={difficulty === d ? 'is-active' : ''}
                            onClick={() => setDifficulty(d)}
                            type="button"
                        >
                            {t(`start.difficulty.${d}`, locale)}
                        </button>
                    ))}
                </div>

                {mode === 'daily' && (
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label={t('start.dailyMode.dateLabel', locale)}
                            value={selectedDate}
                            onChange={(v: Date | null) => v && setSelectedDate(v)}
                            maxDate={new Date()}
                            slots={{
                                day: (dayProps: any) => {
                                    const date: Date = dayProps.day;
                                    if (!date || typeof date.getFullYear !== 'function') return <PickersDay {...dayProps} />;
                                    const has = playedDates.includes(getLocalDateStr(date));
                                    return (
                                        <div style={{ position: 'relative', display: 'inline-block' }}>
                                            <PickersDay {...dayProps} />
                                            {has && (
                                                <div style={{ position: 'absolute', top: -2, right: -2, background: 'var(--gc-good-strong)', borderRadius: 999, width: 14, height: 14, display: 'grid', placeItems: 'center' }}>
                                                    <CheckIcon style={{ fontSize: 9, color: '#fff' }} />
                                                </div>
                                            )}
                                        </div>
                                    );
                                },
                            }}
                            slotProps={{
                                textField: {
                                    sx: { mt: 1, '& .MuiOutlinedInput-root': { background: 'var(--gc-bg-2)' } }
                                }
                            }}
                        />
                    </LocalizationProvider>
                )}

                <button
                    className="gc-btn gc-btn-primary"
                    onClick={start}
                    disabled={loading || (mode === 'daily' && isFuture(selectedDate))}
                    style={{ width: '100%', maxWidth: 320, padding: '14px 22px', fontSize: '1rem', justifyContent: 'center' }}
                >
                    {loading
                        ? <CircularProgress size={18} color="inherit" />
                        : mode === 'daily'
                            ? t('start.dailyMode.playWithDate', locale).replace('{{date}}', getLocalDateStr(selectedDate))
                            : mode === 'text' ? t('start.textMode.play', locale)
                            : mode === 'blur' ? t('start.blurMode.play', locale)
                            : t('start.startNewGame', locale)
                    }
                </button>

                {error && (
                    <div style={{
                        background: 'rgba(199,41,41,0.15)',
                        color: '#fca0a0',
                        border: '1px solid rgba(199,41,41,0.4)',
                        borderRadius: 10,
                        padding: '10px 14px',
                        textAlign: 'center',
                        maxWidth: 440,
                    }}>
                        ⚠️ {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ModePicker;
