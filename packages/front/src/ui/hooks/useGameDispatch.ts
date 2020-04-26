import { GameAction } from '../../action/game-action/GameAction';
import { serviceDispatch } from '../../services/serviceDispatch';
import { SendMessageAction } from '../../socket/WSClient';

type Params = {
    [ K in string ]: (...args) => Exclude<GameAction, SendMessageAction>;
};

export const useGameDispatch = <P extends Params>(map: P): P => {

    return serviceDispatch(map);
};
