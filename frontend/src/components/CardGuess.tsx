import React, { useEffect, useRef, useState } from 'react';
import { guessCard } from '../services/mtgApi';
import { fetchCardNames } from '../services/mtgAutocomplete';
import { useLocale } from '../contexts/LocaleContext';
import { t } from '../utils/translate';

type CardGuessProps = {
    onGuess: (result: any) => void;
    gameId: string | null;
    userId: string;
    name: string;
    email: string;
    attempts: number;
    timeSpent: number;
    /** Already-guessed names to filter out of suggestions. */
    excluded?: string[];
};

export function CardGuess({ onGuess, gameId, userId, name, email, attempts, timeSpent, excluded = [] }: CardGuessProps) {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState<string[]>([]);
    const [highlight, setHighlight] = useState(0);
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const { locale } = useLocale();

    const excludedSet = React.useMemo(
        () => new Set(excluded.map(n => n.toLowerCase())),
        [excluded]
    );

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (!containerRef.current) return;
            if (!containerRef.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        let cancelled = false;
        if (input.length < 2) {
            setOptions([]);
            return;
        }
        const id = setTimeout(async () => {
            const names = await fetchCardNames(input);
            if (cancelled) return;
            const filtered = names.filter(n => !excludedSet.has(n.toLowerCase())).slice(0, 8);
            setOptions(filtered);
            setHighlight(0);
            setOpen(true);
        }, 180);
        return () => { cancelled = true; clearTimeout(id); };
    }, [input, excludedSet]);

    const submitGuess = async (cardName: string) => {
        if (!gameId) {
            setError(t('errors.gameNotStarted', locale));
            return;
        }
        if (!cardName.trim()) return;
        setLoading(true);
        setOpen(false);
        setError(null);
        try {
            const data = await guessCard(cardName, gameId, userId, name, email, attempts, timeSpent);
            onGuess(data);
            setInput('');
            setOptions([]);
        } catch (err) {
            setError(t('errors.guessFailed', locale));
        } finally {
            setLoading(false);
            inputRef.current?.focus();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const pick = options[highlight] || input;
        submitGuess(pick);
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!open || options.length === 0) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlight(h => (h + 1) % options.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlight(h => (h - 1 + options.length) % options.length);
        } else if (e.key === 'Escape') {
            setOpen(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="gc-guess-wrap" autoComplete="off">
            <div className="gc-guessbox" ref={containerRef}>
                <input
                    ref={inputRef}
                    type="text"
                    placeholder={t('guess.placeholder', locale)}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onFocus={() => input.length >= 2 && setOpen(true)}
                    onKeyDown={onKeyDown}
                    disabled={loading}
                    aria-label={t('guess.placeholder', locale)}
                    autoFocus
                />
                {open && options.length > 0 && (
                    <div className="gc-suggestions" role="listbox">
                        {options.map((opt, i) => (
                            <button
                                key={opt}
                                type="button"
                                className={`gc-suggestion ${i === highlight ? 'is-active' : ''}`}
                                onMouseEnter={() => setHighlight(i)}
                                onClick={() => submitGuess(opt)}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            {error && (
                <div role="alert" className="gc-toast" onClick={() => setError(null)}>
                    ⚠️ {error}
                </div>
            )}
        </form>
    );
}

export default CardGuess;
