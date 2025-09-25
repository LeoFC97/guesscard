import React from 'react';
import { Auth0Provider } from '@auth0/auth0-react';
import Home from './pages/Home';
import { useAuth0 } from '@auth0/auth0-react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

const domain = process.env.REACT_APP_AUTH0_DOMAIN || '';
const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID || '';

const App: React.FC = () => {
    return (
        <Auth0Provider
            domain={domain}
            clientId={clientId}
            authorizationParams={{ redirect_uri: window.location.origin }}
        >
            <RequireAuth>
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