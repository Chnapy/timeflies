import React from 'react';
import { LoginPage } from '../../login-page/view/login-page';
import { useGameSelector } from '../../store/hooks/use-game-selector';

export const NeedAuth: React.FC = ({ children }) => {
    const hasCredentials = useGameSelector(state => !!state.credentials);

    return hasCredentials
        ? <>{children}</>
        : <LoginPage />;
};
