import React, { useState } from 'react';
import { useLocale } from '../contexts/LocaleContext';
import { t } from '../utils/translate';
import { Box, Button, TextField, Typography, CircularProgress } from '@mui/material';

interface LoginProps {
  onLoginSuccess: (token: string, userId: string, name: string, email: string) => void;
}

const AUTH0_DOMAIN = process.env.REACT_APP_AUTH0_DOMAIN || '';
const AUTH0_CLIENT_ID = process.env.REACT_APP_AUTH0_CLIENT_ID || '';
const AUTH0_AUDIENCE = process.env.REACT_APP_AUTH0_AUDIENCE || '';

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const { locale } = useLocale();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Função para trocar o código de autorização pelo token
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      const fetchToken = async () => {
        try {
          const res = await fetch(`https://${AUTH0_DOMAIN}/oauth/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              grant_type: 'authorization_code',
              client_id: AUTH0_CLIENT_ID,
              code,
              redirect_uri: window.location.origin,
            }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error_description || t('login.unknownError', locale || 'pt'));
          const { access_token, id_token } = data;
          // Decodifica o id_token para pegar userId, name, email
          const payload = id_token ? JSON.parse(atob(id_token.split('.')[1])) : {};
          onLoginSuccess(access_token, payload.sub || '', payload.name || '', payload.email || '');
          // Limpa o código da URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (err: any) {
          setError(err.message || t('login.unknownError', locale || 'pt'));
        }
      };
      fetchToken();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Auth0 Resource Owner Password Grant
      const res = await fetch(`https://${AUTH0_DOMAIN}/oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'password',
          username: email,
          password,
          audience: AUTH0_AUDIENCE,
          client_id: AUTH0_CLIENT_ID,
          scope: 'openid profile email',
        }),
      });
      const data = await res.json();
          if (!res.ok) throw new Error(data.error_description || t('login.unknownError', locale || 'pt'));
      const { access_token, id_token } = data;
      // Decodifica o id_token para pegar userId, name, email
      const payload = id_token ? JSON.parse(atob(id_token.split('.')[1])) : {};
      onLoginSuccess(access_token, payload.sub || '', payload.name || '', payload.email || email);
    } catch (err: any) {
      setError(err.message || t('login.unknownError', locale || 'pt'));
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = () => {
    // Universal Login com Authorization Code (PKCE)
    const redirectUri = window.location.origin;
    const url = `https://${AUTH0_DOMAIN}/authorize?response_type=code&client_id=${AUTH0_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=openid profile email`;
    window.location.href = url;
  };

  const handleGuest = () => {
    onLoginSuccess('guest', 'guest', t('login.guestName', locale || 'pt'), '');
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      sx={{
        bgcolor: '#16242c',
        border: '1px solid #2d3c45',
        borderRadius: 3,
        p: { xs: 2.5, sm: 5 },
        width: { xs: 'calc(100vw - 32px)', sm: 380 },
        maxWidth: 380,
        mx: { xs: 2, sm: 0 },
        boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
      }}
    >
      <Box sx={{
        width: 48, height: 48, borderRadius: 2,
        background: 'linear-gradient(135deg, #08c3bd, #06a7ac)',
        color: '#062227', display: 'grid', placeItems: 'center',
        fontWeight: 800, fontSize: '1.4rem', mb: 2,
      }}>G</Box>
      <Typography variant="h5" mb={2} sx={{ fontWeight: 200, letterSpacing: 0.5 }}>{t('login.title', locale || 'pt')}</Typography>
      <form onSubmit={handleLogin} style={{ width: '100%', maxWidth: 320 }}>
        <TextField
          label={t('login.email', locale || 'pt')}
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label={t('login.password', locale || 'pt')}
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        {error && <Typography color="error" mt={1}>{error}</Typography>}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : t('login.submit', locale || 'pt')}
        </Button>
      </form>
      <Button
        variant="outlined"
        color="primary"
        fullWidth
        sx={{ mt: 2 }}
        onClick={handleSocialLogin}
      >
        {t('login.social', locale || 'pt')}
      </Button>
      <Button
        variant="text"
        color="secondary"
        fullWidth
        sx={{ mt: 2 }}
        onClick={handleGuest}
      >
        {t('login.guest', locale || 'pt')}
      </Button>
    </Box>
  );
};

export default Login;
