import React, { useState } from 'react';
import { Auth0Provider } from '@auth0/auth0-react';
import Home from './pages/Home';
import { IconButton, Dialog, Box } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MeuPerfil from './components/MeuPerfil';
import { useUserInfo } from './hooks/useUserInfo';
import { useDailyPlayedDates } from './hooks/useDailyPlayedDates';
import { useAuth0 } from '@auth0/auth0-react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

const domain = process.env.REACT_APP_AUTH0_DOMAIN || '';
const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID || '';

const App: React.FC = () => {
    // Perfil state
    const { userId, name, email } = useUserInfo();
    const [perfilOpen, setPerfilOpen] = useState(false);
    const [perfilStats, setPerfilStats] = useState<any>({ dailyDates: [], stats: {} });
    React.useEffect(() => {
        if (!userId) return;
        fetch(`${process.env.REACT_APP_API_URL}/api/user-stats/${userId}`)
            .then(res => res.json())
            .then(data => setPerfilStats(data))
            .catch(() => setPerfilStats({ dailyDates: [], stats: {} }));
    }, [userId, perfilOpen]);
    return (
        <Auth0Provider
            domain={domain}
            clientId={clientId}
            authorizationParams={{ redirect_uri: window.location.origin }}
        >
            <RequireAuth>
                <Box position="fixed" top={16} right={24} zIndex={2000}>
                    <IconButton color="primary" onClick={() => setPerfilOpen(true)} size="large">
                        <AccountCircleIcon fontSize="inherit" />
                    </IconButton>
                </Box>
                <Dialog open={perfilOpen} onClose={() => setPerfilOpen(false)}>
                    <MeuPerfil userId={userId} name={name} email={email} dailyDates={perfilStats.dailyDates || []} stats={perfilStats.stats || {}} />
                </Dialog>
                <Router>
                    <Routes>
                        <Route path="/" element={<Home />} />
                    </Routes>
                </Router>
            </RequireAuth>
        </Auth0Provider>
    );
};

function RequireAuth({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
    if (isLoading) return <div>Carregando...</div>;
    if (!isAuthenticated) {
        loginWithRedirect();
        return <div>Redirecionando para login...</div>;
    }
    return <>{children}</>;
}

export default App;