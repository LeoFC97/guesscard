import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import Leaderboards from '../components/Leaderboards';
import { useLocale } from '../contexts/LocaleContext';
import { t } from '../utils/translate';

interface LeaderboardsPageProps {
    themeMode?: 'light' | 'dark';
}

const LeaderboardsPage: React.FC<LeaderboardsPageProps> = () => {
    const navigate = useNavigate();
    const { locale } = useLocale();

    return (
        <AppShell
            active="leaderboards"
            onSelect={(tab) => {
                if (tab === 'leaderboards') return;
                navigate('/');
            }}
            onBrandClick={() => navigate('/')}
        >
            <Leaderboards themeMode="dark" />
        </AppShell>
    );
};

export default LeaderboardsPage;
