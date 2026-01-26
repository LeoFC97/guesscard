import React from 'react';
import { Box, Chip, Typography, Stack, Paper } from '@mui/material';
import { useLocale } from '../contexts/LocaleContext';
import { t } from '../utils/translate';

const getColor = (status: string) => {
    if (status === 'correct') return 'success';
    if (status === 'partial' || status === 'more rare' || status === 'less rare' || status === 'higher' || status === 'lower') return 'warning';
    return 'error';
};

const getLabel = (status: string) => {
    if (status === 'correct') return '✔️';
    if (status === 'partial') return '🟡';
    if (status === 'more rare') return '⬆️';
    if (status === 'less rare') return '⬇️';
    if (status === 'higher') return '⬆️';
    if (status === 'lower') return '⬇️';
    return '❌';
};

const formatValue = (value: any) => {
    if (value === 0) return '0';
    if (value === undefined || value === null || value === '') return '-';
    return String(value);
};

const StatusChip = ({ status, sx }: { status: string; sx?: any }) => (
    <Chip
        label={getLabel(status)}
        color={getColor(status)}
        size="small"
        sx={{
            bgcolor: getColor(status) === 'success' ? '#388e3c' : getColor(status) === 'warning' ? '#fbc02d' : '#c62828',
            color: '#fff',
            fontWeight: 800,
            fontSize: '0.75rem',
            minWidth: 32,
            height: 24,
            '& .MuiChip-label': { px: 0.6 },
            ...sx
        }}
    />
);

export function GuessHistory({ guesses, themeMode }: { guesses: any[], themeMode?: 'light' | 'dark' }) {
    const { locale } = useLocale();
    // Mostra até 10 palpites (mais compacto)
    const shownGuesses = guesses.slice(0, 10);
    // Usa themeMode para cor da fonte
    const isDark = themeMode === 'dark';
    const gridColumns = 'minmax(220px, 1.6fr) repeat(6, minmax(120px, 1fr))';
    const headerTextColor = isDark ? '#ffffff' : '#1f2937';
    const valueTextColor = isDark ? '#ffffff' : '#111827';
    const mutedTextColor = isDark ? '#e0e0e0' : '#6b7280';
    const rowBorder = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)';
    // Função para converter array de cores em iniciais
    const getColorInitials = (colors: string[] | undefined) => {
        if (!Array.isArray(colors) || colors.length === 0) return '-';
        // Magic: U=Azul, R=Vermelho, B=Preto, G=Verde, W=Branco
        const colorMap: Record<string, string> = {
            'Blue': 'U',
            'Red': 'R',
            'Black': 'B',
            'Green': 'G',
            'White': 'W',
        };
        return colors.map(c => colorMap[c] || c[0]).join(',');
    };
    // Função para mostrar legalidades principais e aplicar estratégia de parcialmente correta
    const renderLegalities = (guessedLegalities?: any, targetLegalities?: any) => {
        if (!guessedLegalities || !targetLegalities) return '-';
        const formats = ['pauper', 'modern', 'legacy', 'vintage', 'standard'];
        let guessedObj: Record<string, string> = {};
        let targetObj: Record<string, string> = {};
        if (Array.isArray(guessedLegalities)) {
            for (const l of guessedLegalities) {
                if (l.format && l.legality) guessedObj[l.format.toLowerCase()] = l.legality;
            }
        } else {
            guessedObj = guessedLegalities;
        }
        if (Array.isArray(targetLegalities)) {
            for (const l of targetLegalities) {
                if (l.format && l.legality) targetObj[l.format.toLowerCase()] = l.legality;
            }
        } else {
            targetObj = targetLegalities;
        }
        return (
            <Box display="flex" flexDirection="column" gap={0.5}>
                {formats.map(fmt => {
                    const guessed = guessedObj[fmt];
                    const target = targetObj[fmt];
                    let color: 'success' | 'warning' | 'error' = 'error';
                    let label = '❌';
                    if (target === 'Legal') {
                        color = 'success';
                        label = '✔️';
                    } else if (target === 'Restricted') {
                        color = 'warning';
                        label = '🟡';
                    } else if (target === 'Banned') {
                        color = 'error';
                        label = '❌';
                    } else {
                        color = 'error';
                        label = '❌';
                    }
                    return (
                        <Chip
                            key={fmt}
                            label={fmt[0].toUpperCase() + fmt.slice(1) + ': ' + (target || '-') + ' ' + label}
                            color={color}
                            size="small"
                            sx={{ mb: 0.5 }}
                        />
                    );
                })}
            </Box>
        );
    };
            return (
                <Box 
                    mt={{ xs: 2, sm: 3, md: 4 }} 
                    sx={{ 
                        width: '100%', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        px: { xs: 1, sm: 0 }
                    }}
                >
                    <Typography 
                        variant="h6" 
                        sx={{ 
                            mb: { xs: 1, sm: 2 }, 
                            color: isDark ? '#e0e0e0' : '#6b7280', 
                            fontWeight: 600,
                            fontSize: { xs: '1rem', sm: '1.25rem' },
                            textAlign: 'center'
                        }}
                    >
                        {t('history.title', locale)}
                    </Typography>
                            
                            {/* Layout responsivo - tabela em desktop, cards em mobile */}
                            <Box sx={{ 
                                width: '100%', 
                                maxWidth: { xs: '100%', lg: 1100 }, 
                                mt: { xs: 1, sm: 2 }
                            }}>
                                {/* Desktop Grid Table */}
                                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                                    <Paper
                                        variant="outlined"
                                        sx={{
                                            backgroundColor: isDark ? '#1f2435' : '#fff',
                                            borderColor: rowBorder,
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <Box sx={{ overflowX: 'auto' }}>
                                            <Box sx={{ minWidth: 980 }}>
                                                <Box
                                                    sx={{
                                                        display: 'grid',
                                                        gridTemplateColumns: gridColumns,
                                                        alignItems: 'center',
                                                        columnGap: 1.5,
                                                        px: 2,
                                                        py: 1.2,
                                                        backgroundColor: isDark ? '#151a28' : '#f3f4f6',
                                                        borderBottom: `1px solid ${rowBorder}`
                                                    }}
                                                >
                                                    {[
                                                        t('history.columns.card', locale),
                                                        t('history.columns.color', locale),
                                                        t('history.columns.type', locale),
                                                        t('history.columns.cmc', locale),
                                                        t('history.columns.edition', locale),
                                                        t('history.columns.rarity', locale),
                                                        t('history.columns.artist', locale)
                                                    ].map((label, index) => (
                                                        <Typography
                                                            key={label}
                                                            variant="caption"
                                                            sx={{
                                                                fontWeight: 800,
                                                                fontSize: '0.8rem',
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '0.04em',
                                                                color: headerTextColor,
                                                                textAlign: index === 0 ? 'left' : 'center'
                                                            }}
                                                        >
                                                            {label}
                                                        </Typography>
                                                    ))}
                                                </Box>
                                                {shownGuesses.length > 0 ? shownGuesses.map((g, idx) => {
                                                    const cardName = formatValue(g.guessedCard?.name);
                                                    const colorValue = getColorInitials(g.guessedCard?.colors);
                                                    const typeValue = formatValue(g.guessedCard?.type || g.guessedCard?.types?.[0]);
                                                    const cmcValue = formatValue(g.guessedCard?.cmc ?? g.guessedCard?.convertedManaCost);
                                                    const setNameValue = formatValue(g.guessedCard?.setName);
                                                    const rarityValue = formatValue(g.guessedCard?.rarity);
                                                    const artistValue = formatValue(g.guessedCard?.artist);
                                                    return (
                                                        <Box
                                                            key={`${cardName}-${idx}`}
                                                            sx={{
                                                                display: 'grid',
                                                                gridTemplateColumns: gridColumns,
                                                                alignItems: 'center',
                                                                columnGap: 1.5,
                                                                px: 2,
                                                                py: 1.2,
                                                                borderBottom: idx === shownGuesses.length - 1 ? 'none' : `1px solid ${rowBorder}`,
                                                                backgroundColor: idx % 2 === 0 ? (isDark ? '#1d2233' : '#fafafa') : (isDark ? '#20263a' : '#fff')
                                                            }}
                                                        >
                                                            <Box sx={{ pr: 2 }}>
                                                                <Typography
                                                                    sx={{
                                                                        fontWeight: 700,
                                                                        color: valueTextColor,
                                                                        fontSize: '0.95rem',
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis',
                                                                        whiteSpace: 'nowrap'
                                                                    }}
                                                                    title={cardName}
                                                                >
                                                                    {cardName}
                                                                </Typography>
                                                                <Typography
                                                                    variant="caption"
                                                                    sx={{ color: mutedTextColor }}
                                                                >
                                                                    {`#${shownGuesses.length - idx}`}
                                                                </Typography>
                                                            </Box>
                                                            <Stack direction="row" spacing={0.75} alignItems="center" justifyContent="center">
                                                                <StatusChip status={g.feedback.colors} />
                                                                <Typography
                                                                    sx={{
                                                                        fontWeight: 700,
                                                                        fontSize: '0.9rem',
                                                                        color: valueTextColor
                                                                    }}
                                                                >
                                                                    {colorValue}
                                                                </Typography>
                                                            </Stack>
                                                            <Stack direction="row" spacing={0.75} alignItems="center" justifyContent="center">
                                                                <StatusChip status={g.feedback.type} />
                                                                <Typography
                                                                    sx={{
                                                                        fontWeight: 600,
                                                                        fontSize: '0.85rem',
                                                                        color: valueTextColor,
                                                                        maxWidth: 140,
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis',
                                                                        whiteSpace: 'nowrap'
                                                                    }}
                                                                    title={typeValue}
                                                                >
                                                                    {typeValue}
                                                                </Typography>
                                                            </Stack>
                                                            <Stack direction="row" spacing={0.75} alignItems="center" justifyContent="center">
                                                                <StatusChip status={g.feedback.cmc} />
                                                                <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: valueTextColor }}>
                                                                    {cmcValue}
                                                                </Typography>
                                                            </Stack>
                                                            <Stack direction="row" spacing={0.75} alignItems="center" justifyContent="center">
                                                                <StatusChip status={g.feedback.edition} />
                                                                <Typography
                                                                    sx={{
                                                                        fontWeight: 600,
                                                                        fontSize: '0.85rem',
                                                                        color: valueTextColor,
                                                                        maxWidth: 140,
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis',
                                                                        whiteSpace: 'nowrap'
                                                                    }}
                                                                    title={setNameValue}
                                                                >
                                                                    {setNameValue}
                                                                </Typography>
                                                            </Stack>
                                                            <Stack direction="row" spacing={0.75} alignItems="center" justifyContent="center">
                                                                <StatusChip status={g.feedback.rarity} />
                                                                <Typography
                                                                    sx={{
                                                                        fontWeight: 600,
                                                                        fontSize: '0.85rem',
                                                                        color: valueTextColor,
                                                                        maxWidth: 140,
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis',
                                                                        whiteSpace: 'nowrap'
                                                                    }}
                                                                    title={rarityValue}
                                                                >
                                                                    {rarityValue}
                                                                </Typography>
                                                            </Stack>
                                                            <Stack direction="row" spacing={0.75} alignItems="center" justifyContent="center">
                                                                <StatusChip status={g.feedback.artist} />
                                                                <Typography
                                                                    sx={{
                                                                        fontWeight: 600,
                                                                        fontSize: '0.85rem',
                                                                        color: valueTextColor,
                                                                        maxWidth: 160,
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis',
                                                                        whiteSpace: 'nowrap'
                                                                    }}
                                                                    title={artistValue}
                                                                >
                                                                    {artistValue}
                                                                </Typography>
                                                            </Stack>
                                                        </Box>
                                                    );
                                                }) : (
                                                    <Box sx={{ px: 2, py: 2, textAlign: 'center', color: mutedTextColor }}>
                                                        {t('history.emptyLong', locale)}
                                                    </Box>
                                                )}
                                            </Box>
                                        </Box>
                                    </Paper>
                                </Box>
                                
                                {/* Mobile Cards */}
                                <Box sx={{ display: { xs: 'block', md: 'none' }, px: { xs: 1, sm: 0 } }}>
                                    <Stack spacing={{ xs: 1.5, sm: 2 }}>
                                        {shownGuesses.length > 0 ? shownGuesses.map((g, idx) => (
                                            <Paper 
                                                key={idx} 
                                                sx={{ 
                                                    p: { xs: 1.5, sm: 2 }, 
                                                    backgroundColor: isDark ? '#2a2f42' : '#f5f5f5',
                                                    border: `1px solid ${isDark ? '#444' : '#ddd'}`,
                                                    borderRadius: 2
                                                }}
                                            >
                                                <Typography 
                                                    variant="subtitle2" 
                                                    sx={{ 
                                                        fontWeight: 700, 
                                                        mb: 1,
                                                        fontSize: { xs: '0.8rem', sm: '0.9rem' },
                                                        lineHeight: 1.2,
                                                        wordBreak: 'break-word',
                                                        color: isDark ? '#ffffff' : '#111827'
                                                    }}
                                                >
                                                    {g.guessedCard?.name}
                                                </Typography>
                                                <Stack spacing={0.8}>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <StatusChip status={g.feedback.colors} sx={{ minWidth: 28, height: 22, fontSize: '0.7rem' }} />
                                                        <Typography variant="caption" sx={{ fontWeight: 700, color: isDark ? '#e0e0e0' : '#6b7280', minWidth: 64 }}>
                                                            {t('history.labels.color', locale)}
                                                        </Typography>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{ fontWeight: 600, color: valueTextColor }}
                                                        >
                                                            {getColorInitials(g.guessedCard?.colors)}
                                                        </Typography>
                                                    </Stack>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <StatusChip status={g.feedback.type} sx={{ minWidth: 28, height: 22, fontSize: '0.7rem' }} />
                                                        <Typography variant="caption" sx={{ fontWeight: 700, color: isDark ? '#e0e0e0' : '#6b7280', minWidth: 64 }}>
                                                            {t('history.labels.type', locale)}
                                                        </Typography>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{ fontWeight: 600, color: valueTextColor }}
                                                        >
                                                            {formatValue(g.guessedCard?.type || g.guessedCard?.types?.[0])}
                                                        </Typography>
                                                    </Stack>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <StatusChip status={g.feedback.cmc} sx={{ minWidth: 28, height: 22, fontSize: '0.7rem' }} />
                                                        <Typography variant="caption" sx={{ fontWeight: 700, color: isDark ? '#e0e0e0' : '#6b7280', minWidth: 64 }}>
                                                            {t('history.labels.cmc', locale)}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 600, color: valueTextColor }}>
                                                            {formatValue(g.guessedCard?.cmc ?? g.guessedCard?.convertedManaCost)}
                                                        </Typography>
                                                    </Stack>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <StatusChip status={g.feedback.edition} sx={{ minWidth: 28, height: 22, fontSize: '0.7rem' }} />
                                                        <Typography variant="caption" sx={{ fontWeight: 700, color: isDark ? '#e0e0e0' : '#6b7280', minWidth: 64 }}>
                                                            {t('history.labels.edition', locale)}
                                                        </Typography>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                fontWeight: 600,
                                                                color: valueTextColor,
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap'
                                                            }}
                                                            title={formatValue(g.guessedCard?.setName)}
                                                        >
                                                            {formatValue(g.guessedCard?.setName)}
                                                        </Typography>
                                                    </Stack>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <StatusChip status={g.feedback.rarity} sx={{ minWidth: 28, height: 22, fontSize: '0.7rem' }} />
                                                        <Typography variant="caption" sx={{ fontWeight: 700, color: isDark ? '#e0e0e0' : '#6b7280', minWidth: 64 }}>
                                                            {t('history.labels.rarity', locale)}
                                                        </Typography>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                fontWeight: 600,
                                                                color: valueTextColor,
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap'
                                                            }}
                                                            title={formatValue(g.guessedCard?.rarity)}
                                                        >
                                                            {formatValue(g.guessedCard?.rarity)}
                                                        </Typography>
                                                    </Stack>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <StatusChip status={g.feedback.artist} sx={{ minWidth: 28, height: 22, fontSize: '0.7rem' }} />
                                                        <Typography variant="caption" sx={{ fontWeight: 700, color: isDark ? '#e0e0e0' : '#6b7280', minWidth: 64 }}>
                                                            {t('history.labels.artist', locale)}
                                                        </Typography>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                fontWeight: 600,
                                                                color: valueTextColor,
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap'
                                                            }}
                                                            title={formatValue(g.guessedCard?.artist)}
                                                        >
                                                            {formatValue(g.guessedCard?.artist)}
                                                        </Typography>
                                                    </Stack>
                                                </Stack>
                                            </Paper>
                                        )) : (
                                            <Typography 
                                                variant="body2" 
                                                sx={{ 
                                                    textAlign: 'center', 
                                                    color: isDark ? '#e0e0e0' : '#6b7280',
                                                    py: 3,
                                                    fontSize: { xs: '0.8rem', sm: '0.875rem' }
                                                }}
                                            >
                                                {t('history.emptyShort', locale)}
                                            </Typography>
                                        )}
                                    </Stack>
                                </Box>
                            </Box>
                    {/* Legenda visual dos ícones */}
                    <Stack direction="row" spacing={1} sx={{ mt: 2, mb: 2, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <Typography variant="caption" sx={{ color: isDark ? '#e0e0e0' : '#6b7280', fontWeight: 600 }}>
                            {t('history.legend.title', locale)}
                        </Typography>
                        <Chip label={t('history.legend.correct', locale)} size="small" sx={{ bgcolor: '#388e3c', color: '#fff', fontWeight: 700 }} />
                        <Chip label={t('history.legend.partial', locale)} size="small" sx={{ bgcolor: '#fbc02d', color: '#fff', fontWeight: 700 }} />
                        <Chip label={t('history.legend.incorrect', locale)} size="small" sx={{ bgcolor: '#c62828', color: '#fff', fontWeight: 700 }} />
                        <Chip label={t('history.legend.higher', locale)} size="small" sx={{ bgcolor: '#fbc02d', color: '#fff', fontWeight: 700 }} />
                        <Chip label={t('history.legend.lower', locale)} size="small" sx={{ bgcolor: '#fbc02d', color: '#fff', fontWeight: 700 }} />
                    </Stack>
                </Box>
            );
}

export default GuessHistory;
