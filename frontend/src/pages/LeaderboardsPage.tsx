import React from 'react';
import Leaderboards from '../components/Leaderboards';

interface LeaderboardsPageProps {
    themeMode?: 'light' | 'dark';
}

const LeaderboardsPage: React.FC<LeaderboardsPageProps> = ({ themeMode = 'dark' }) => {
    return <Leaderboards themeMode={themeMode} />;
};

export default LeaderboardsPage;