import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import OtpPage from './pages/OtpPage';

export type View = 'login' | 'otp';

interface Route {
    view: View;
    param?: string;
}

const parseHash = (): Route => {
    const hash = window.location.hash.substring(2) || 'login'; // remove '#/'
    const parts = hash.split('/');
    const view = parts[0] as View;
    const param = parts[1];

    switch (view) {
        case 'otp': return { view: 'otp', param };
        case 'login':
        default:
            return { view: 'login' };
    }
};

const App: React.FC = () => {
    const [route, setRoute] = useState<Route>(parseHash());
    
    useEffect(() => {
        const handleHashChange = () => {
            setRoute(parseHash());
            window.scrollTo(0, 0);
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);
    
    const renderView = () => {
        switch (route.view) {
            case 'otp':
                return <OtpPage phone={route.param} />;
            case 'login':
            default:
                return <LoginPage />;
        }
    };

    return (
        <div>
            {renderView()}
        </div>
    );
};

export default App;