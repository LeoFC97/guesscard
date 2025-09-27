import React, { useState } from 'react';
import { Auth0Provider } from '@auth0/auth0-react';
import Home from './pages/Home';
import { IconButton, Dialog, Box } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MeuPerfil from './components/MeuPerfil';
import Login from './components/Login';
import { useAuth0 } from '@auth0/auth0-react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

const domain = process.env.REACT_APP_AUTH0_DOMAIN || '';
const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID || '';

const App: React.FC = () => {
    // Se guest, não persiste no localStorage
    const getInitial = (key: string) => {
        const value = localStorage.getItem(key);
        if (value === 'guest') return '';
        return value || '';
    };
    const [token, setToken] = useState<string | null>(getInitial('auth_token'));
    const [userId, setUserId] = useState<string>(getInitial('user_id'));
    const [name, setName] = useState<string>(getInitial('user_name'));
    const [email, setEmail] = useState<string>(getInitial('user_email'));
    const [perfilOpen, setPerfilOpen] = useState(false);
    const [perfilStats, setPerfilStats] = useState<any>({ dailyDates: [], stats: {} });
    // Exemplo: buscar perfil quando modal abrir e userId existir
    React.useEffect(() => {
        if (!perfilOpen || !userId) return;
        // ...buscar perfil do usuário usando userId e token...
    }, [perfilOpen, userId]);

        // Salva dados no localStorage após login
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

        // Exemplo: buscar perfil quando modal abrir e userId existir
        React.useEffect(() => {
            if (!perfilOpen || !userId) return;
            // ...buscar perfil do usuário usando userId e token...
        }, [perfilOpen, userId, token]);
    // Renderiza tela de login se não estiver logado
    if (!token || !userId) {
        return <Login onLoginSuccess={handleLoginSuccess} />;
    }

    // Renderiza botão de perfil e modal apenas se usuário estiver logado e não for guest
    const isGuest = userId === 'guest';
    return (
        <>
            {!isGuest && (
                <Box position="fixed" top={16} right={24} zIndex={2000}>
                    <IconButton
                        color="primary"
                        onClick={() => setPerfilOpen(true)}
                        size="large"
                        disabled={!userId}
                    >
                        <AccountCircleIcon fontSize="inherit" />
                    </IconButton>
                </Box>
            )}
            <Dialog open={perfilOpen} onClose={() => setPerfilOpen(false)}>
                {isGuest ? (
                    <Box minWidth={320} maxWidth={400} p={3} borderRadius={3} bgcolor="#fff" boxShadow={4} display="flex" alignItems="center" justifyContent="center" height={200}>
                        <span>Você está jogando como visitante. Nenhum dado de perfil será salvo.</span>
                    </Box>
                ) : (
                    <MeuPerfil userId={userId} name={name} email={email} dailyDates={perfilStats.dailyDates || []} stats={perfilStats.stats || {}} />
                )}
            </Dialog>
            <Router>
                <Routes>
                    <Route path="/" element={<Home userId={userId} name={name} email={email} />} />
                </Routes>
            </Router>
        </>
    );
};



export default App;