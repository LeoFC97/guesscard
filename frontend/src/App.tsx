import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Dialog, Box } from '@mui/material';
import Home from './pages/Home';
import LeaderboardsPage from './pages/LeaderboardsPage';
import Login from './components/Login';
import MeuPerfil from './components/MeuPerfil';
import CoinStatement from './components/CoinStatement';
import { CoinsProvider } from './contexts/CoinsContext';
import { useLocale } from './contexts/LocaleContext';
import { t } from './utils/translate';
import { fetchUserProfile } from './services/mtgApi';

const getInitial = (key: string) => {
    const value = localStorage.getItem(key);
    if (value === 'guest') return '';
    return value || '';
};

const App: React.FC = () => {
    const { locale } = useLocale();
    const [token, setToken] = useState<string | null>(getInitial('auth_token'));
    const [userId, setUserId] = useState<string>(getInitial('user_id'));
    const [name, setName] = useState<string>(getInitial('user_name'));
    const [email, setEmail] = useState<string>(getInitial('user_email'));
    const [perfilOpen, setPerfilOpen] = useState(false);
    const [coinStatementOpen, setCoinStatementOpen] = useState(false);
    const [perfilStats, setPerfilStats] = useState<any>({ dailyDates: [], stats: {} });

    useEffect(() => {
        if (!perfilOpen || !userId) return;
        let cancelled = false;
        (async () => {
            try {
                const profileData = await fetchUserProfile(userId, token);
                if (!cancelled) setPerfilStats(profileData);
            } catch (err) {
                console.error('Error fetching profile:', err);
            }
        })();
        return () => { cancelled = true; };
    }, [perfilOpen, userId, token]);

    const handleLoginSuccess = (newToken: string, newUserId: string, newName: string, newEmail: string) => {
        setToken(newToken);
        setUserId(newUserId);
        setName(newName);
        setEmail(newEmail);
        if (newUserId !== 'guest') {
            localStorage.setItem('auth_token', newToken);
            localStorage.setItem('user_id', newUserId);
            localStorage.setItem('user_name', newName);
            localStorage.setItem('user_email', newEmail);
        } else {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_id');
            localStorage.removeItem('user_name');
            localStorage.removeItem('user_email');
        }
    };

    if (!token || !userId) {
        return (
            <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" sx={{ bgcolor: '#0e1e25' }}>
                <Login onLoginSuccess={handleLoginSuccess} />
            </Box>
        );
    }

    const isGuest = userId === 'guest';

    return (
        <CoinsProvider>
            <Router>
                <Routes>
                    <Route path="/" element={
                        <Home
                            userId={userId}
                            name={name}
                            email={email}
                            onProfileClick={() => setPerfilOpen(true)}
                            onCoinsClick={() => setCoinStatementOpen(true)}
                        />
                    } />
                    <Route path="/leaderboards" element={<LeaderboardsPage />} />
                </Routes>
            </Router>

            <Dialog open={perfilOpen} onClose={() => setPerfilOpen(false)} maxWidth="sm" fullWidth>
                {isGuest ? (
                    <Box p={4} display="flex" alignItems="center" justifyContent="center" minHeight={200}>
                        <span>{t('app.guestPlaying', locale)}</span>
                    </Box>
                ) : (
                    <MeuPerfil
                        userId={userId}
                        name={name}
                        email={email}
                        dailyDates={perfilStats.dailyDates || []}
                        stats={perfilStats.stats || {}}
                        themeMode="dark"
                    />
                )}
            </Dialog>

            <Dialog
                open={coinStatementOpen}
                onClose={() => setCoinStatementOpen(false)}
                maxWidth="lg"
                fullWidth
                PaperProps={{ sx: { bgcolor: '#0e1e25', maxHeight: '90vh' } }}
            >
                <CoinStatement userId={userId} themeMode="dark" />
            </Dialog>
        </CoinsProvider>
    );
};

export default App;
