import { TAction } from './TAction';

export interface MatchmakerEnterCAction extends TAction<'matchmaker/enter'> {
}

export type MatchmakerClientAction =
    | MatchmakerEnterCAction;
