import React, { useState } from 'react';
import { Box, Button, TextField, Typography, CircularProgress } from '@mui/material';

interface LoginProps {
  onLoginSuccess: (token: string, userId: string, name: string, email: string) => void;
}

const AUTH0_DOMAIN = process.env.REACT_APP_AUTH0_DOMAIN || '';
const AUTH0_CLIENT_ID = process.env.REACT_APP_AUTH0_CLIENT_ID || '';
const AUTH0_AUDIENCE = process.env.REACT_APP_AUTH0_AUDIENCE || '';

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
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
          if (!res.ok) throw new Error(data.error_description || 'Erro ao autenticar');
          const { access_token, id_token } = data;
          // Decodifica o id_token para pegar userId, name, email
          const payload = id_token ? JSON.parse(atob(id_token.split('.')[1])) : {};
          onLoginSuccess(access_token, payload.sub || '', payload.name || '', payload.email || '');
          // Limpa o código da URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (err: any) {
          setError(err.message || 'Erro desconhecido');
        }
      };
      fetchToken();
    }
  }, []);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      if (!res.ok) throw new Error(data.error_description || 'Erro ao autenticar');
      const { access_token, id_token } = data;
      // Decodifica o id_token para pegar userId, name, email
      const payload = id_token ? JSON.parse(atob(id_token.split('.')[1])) : {};
      onLoginSuccess(access_token, payload.sub || '', payload.name || '', payload.email || email);
    } catch (err: any) {
      setError(err.message || 'Erro desconhecido');
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
    onLoginSuccess('guest', 'guest', 'Visitante', '');
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight={300}>
      <Typography variant="h5" mb={2}>Login</Typography>
      <form onSubmit={handleLogin} style={{ width: '100%', maxWidth: 320 }}>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Senha"
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
          {loading ? <CircularProgress size={24} /> : 'Entrar'}
        </Button>
      </form>
      <Button
        variant="outlined"
        color="primary"
        fullWidth
        sx={{ mt: 2 }}
        onClick={handleSocialLogin}
      >
        Entrar com rede social
      </Button>
      <Button
        variant="text"
        color="secondary"
        fullWidth
        sx={{ mt: 2 }}
        onClick={handleGuest}
      >
        Jogar como visitante
      </Button>
    </Box>
  );
};

export default Login;
