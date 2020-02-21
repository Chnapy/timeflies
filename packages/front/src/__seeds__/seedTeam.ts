import { TeamSnapshot } from '@timeflies/shared';
import { Team } from '../stages/battle/entities/Team';
import { BattleScene } from '../stages/battle/BattleScene';

const snap: TeamSnapshot = {
    id: 't-1',
    name: 't-1',
    color: '#FF0000',
    playersSnapshots: []
};

export const seedTeam = (snapshot: Partial<TeamSnapshot> = {}, battleScene: BattleScene): Team => {

    return new Team({
        ...snap,
        ...snapshot
    }, battleScene);
};
