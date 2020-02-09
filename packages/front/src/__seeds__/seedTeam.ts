import { TeamSnapshot } from '@timeflies/shared';
import { Team } from '../phaser/entities/Team';
import { BattleScene } from '../phaser/scenes/BattleScene';

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
