import React, { useState } from 'react';
import Home from './pages/Home';
import LeaderboardsPage from './pages/LeaderboardsPage';
import { Dialog, Box } from '@mui/material';
import './styles/mobile.css';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MeuPerfil from './components/MeuPerfil';
import CoinDisplay from './components/CoinDisplay';
import CoinStatement from './components/CoinStatement';
import { ThemeProvider, createTheme, CssBaseline, IconButton, Tooltip } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Login from './components/Login';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { fetchUserProfile } from './services/mtgApi';
import { CoinsProvider } from './contexts/CoinsContext';

const getTheme = (mode: 'light' | 'dark') => createTheme({
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 900,
            lg: 1200,
            xl: 1536,
        },
    },
    palette: {
        mode,
        background: {
            default: mode === 'dark' ? '#181c24' : '#f5f5f5',
            paper: mode === 'dark' ? '#23283a' : '#fff',
        },
        primary: {
            main: mode === 'dark' ? '#a78bfa' : '#1976d2', // lilás mais claro
            contrastText: '#fff',
        },
        secondary: {
            main: mode === 'dark' ? '#ffd54f' : '#ff9800',
            contrastText: mode === 'dark' ? '#23283a' : '#fff',
        },
        error: {
            main: '#ff1744',
            contrastText: '#fff',
        },
        success: {
            main: '#00e676',
            contrastText: '#fff',
        },
        warning: {
            main: '#ffeb3b',
            contrastText: '#23283a',
        },
        info: {
            main: '#29b6f6',
            contrastText: '#fff',
        },
        text: {
            primary: mode === 'dark' ? '#e0e0e0' : '#23283a',
            secondary: mode === 'dark' ? '#bdbdbd' : '#555',
        },
    },
    typography: {
        fontFamily: 'Montserrat, Roboto, Arial',
        h5: { fontWeight: 700, color: mode === 'dark' ? '#fff' : '#23283a' },
        h6: { fontWeight: 600, color: mode === 'dark' ? '#fff' : '#23283a' },
        subtitle1: { color: mode === 'dark' ? '#fff' : '#23283a' },
        subtitle2: { color: mode === 'dark' ? '#bdbdbd' : '#555' },
        // Melhor tipografia para mobile
        body1: {
            fontSize: '1rem',
            '@media (max-width:600px)': {
                fontSize: '0.875rem',
            },
        },
        body2: {
            fontSize: '0.875rem',
            '@media (max-width:600px)': {
                fontSize: '0.75rem',
            },
        },
    },
    components: {
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 600,
                    fontSize: '1rem',
                    color: '#fff',
                },
                colorSuccess: {
                    backgroundColor: '#00e676',
                    color: '#fff',
                },
                colorError: {
                    backgroundColor: '#ff1744',
                    color: '#fff',
                },
                colorWarning: {
                    backgroundColor: '#ffeb3b',
                    color: '#23283a',
                },
                colorInfo: {
                    backgroundColor: '#29b6f6',
                    color: '#fff',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    fontWeight: 700,
                    borderRadius: 8,
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                head: {
                    color: mode === 'dark' ? '#fff' : '#23283a',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                },
                body: {
                    color: mode === 'dark' ? '#e0e0e0' : '#23283a',
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    background: mode === 'dark' ? '#23283a' : '#fff',
                    color: mode === 'dark' ? '#fff' : '#23283a',
                    borderRadius: 8,
                },
                notchedOutline: {
                    borderColor: mode === 'dark' ? '#7c4dff' : '#1976d2',
                },
            },
        },
    },
});

const domain = process.env.REACT_APP_AUTH0_DOMAIN || '';
const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID || '';

const App: React.FC = () => {
    // Estado do tema
    const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
        // Sempre inicia como dark
        return 'dark';
    });
    const theme = getTheme(themeMode);
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
    const [coinStatementOpen, setCoinStatementOpen] = useState(false);
    const [perfilStats, setPerfilStats] = useState<any>({ dailyDates: [], stats: {} });
    // Exemplo: buscar perfil quando modal abrir e userId existir
    React.useEffect(() => {
        if (!perfilOpen || !userId) return;

        const fetchProfile = async () => {
            try {
                const profileData = await fetchUserProfile(userId, token);
                setPerfilStats(profileData);
            } catch (error) {
                console.error('Erro ao buscar perfil do usuário:', error);
            }
        };

        fetchProfile();
    }, [perfilOpen, userId, token]);

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

            const fetchProfile = async () => {
                try {
                    const profileData = await fetchUserProfile(userId, token);
                    setPerfilStats(profileData);
                } catch (error) {
                    console.error('Erro ao buscar perfil do usuário:', error);
                }
            };

            fetchProfile();
        }, [perfilOpen, userId, token]);
    // Renderiza tela de login se não estiver logado
    if (!token || !userId) {
        return (
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Box minHeight="100vh" sx={{
                    background: themeMode === 'dark'
                        ? 'linear-gradient(135deg, #23283a 0%, #181c24 100%)'
                        : 'linear-gradient(135deg, #e3e6f3 0%, #f5f5f5 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'
                }}>
                    <Tooltip title={themeMode === 'dark' ? 'Modo claro' : 'Modo escuro'}>
                        <IconButton
                            sx={{ position: 'absolute', top: 16, right: 24, zIndex: 2100 }}
                            color="secondary"
                            onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
                        >
                            {themeMode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                        </IconButton>
                    </Tooltip>
                    <Login onLoginSuccess={handleLoginSuccess} />
                </Box>
            </ThemeProvider>
        );
    }

    // Renderiza botão de perfil e modal apenas se usuário estiver logado e não for guest
    const isGuest = userId === 'guest';
    return (
        <CoinsProvider>
            <ThemeProvider theme={theme}>
                <CssBaseline />
            <Box minHeight="100vh" sx={{
                background: themeMode === 'dark'
                    ? 'linear-gradient(135deg, #23283a 0%, #181c24 100%)'
                    : 'linear-gradient(135deg, #e3e6f3 0%, #f5f5f5 100%)',
                position: 'relative'
            }}>
                <Tooltip title={themeMode === 'dark' ? 'Modo claro' : 'Modo escuro'}>
                    <IconButton
                        sx={{ 
                            position: 'fixed', 
                            top: { xs: 8, sm: 16 }, 
                            left: { xs: 8, sm: 24 }, 
                            zIndex: 2100,
                            width: { xs: 40, sm: 48 },
                            height: { xs: 40, sm: 48 }
                        }}
                        color="secondary"
                        onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
                    >
                        {themeMode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                    </IconButton>
                </Tooltip>
                {/* Exibir moedas para usuários logados */}
                <CoinDisplay 
                    userId={userId} 
                    themeMode={themeMode} 
                    onClick={() => setCoinStatementOpen(true)}
                />
                
                {!isGuest && (
                    <Box 
                        position="fixed" 
                        top={{ xs: 8, sm: 16 }} 
                        right={{ xs: 8, sm: 24 }} // Posicionamento mais à direita para evitar conflito
                        zIndex={2000}
                    >
                        <IconButton
                            color="primary"
                            onClick={() => setPerfilOpen(true)}
                            size="medium"
                            disabled={!userId}
                            sx={{
                                width: { xs: 40, sm: 48 },
                                height: { xs: 40, sm: 48 }
                            }}
                        >
                            <AccountCircleIcon fontSize="inherit" />
                        </IconButton>
                    </Box>
                )}
                <Dialog open={perfilOpen} onClose={() => setPerfilOpen(false)}>
                    {isGuest ? (
                        <Box minWidth={320} maxWidth={400} p={3} borderRadius={3} bgcolor="background.paper" boxShadow={4} display="flex" alignItems="center" justifyContent="center" height={200}>
                            <span>Você está jogando como visitante. Nenhum dado de perfil será salvo.</span>
                        </Box>
                    ) : (
                        <MeuPerfil userId={userId} name={name} email={email} dailyDates={perfilStats.dailyDates || []} stats={perfilStats.stats || {}} themeMode={themeMode} />
                    )}
                </Dialog>

                {/* Modal do Extrato de Moedas */}
                <Dialog 
                    open={coinStatementOpen} 
                    onClose={() => setCoinStatementOpen(false)}
                    maxWidth="lg"
                    fullWidth
                    PaperProps={{
                        sx: {
                            backgroundColor: themeMode === 'dark' ? '#181c24' : '#f5f5f5',
                            maxHeight: '90vh'
                        }
                    }}
                >
                    <CoinStatement userId={userId} themeMode={themeMode} />
                </Dialog>
                <Router>
                    <Routes>
                        <Route path="/" element={<Home userId={userId} name={name} email={email} themeMode={themeMode} setThemeMode={setThemeMode} />} />
                        <Route path="/leaderboards" element={<LeaderboardsPage themeMode={themeMode} />} />
                    </Routes>
                </Router>
            </Box>
        </ThemeProvider>
        </CoinsProvider>
    );
};



export default App;