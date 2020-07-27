import { AppHeader } from '../ui-components/app-header/app-header';
import React from 'react';
import { useGameCurrentPlayer } from '../hooks/useGameCurrentPlayer';

export const ConnectedAppHeader: React.FC = () => {

    const username = useGameCurrentPlayer(({ name }) => name);

    return <AppHeader username={username} />;
};
