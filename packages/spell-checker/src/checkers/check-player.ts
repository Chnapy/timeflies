import { Checker } from '../checker';

export const checkPlayer: Checker = ({
    context
}) => {
    const { clientContext, currentTurn } = context;

    return clientContext.playerId === currentTurn.playerId;
};
