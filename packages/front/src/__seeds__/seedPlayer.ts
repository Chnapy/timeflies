import 'phaser';
import { PlayerSnapshot } from '@timeflies/shared';
import { Player } from '../stages/battle/entities/Player';
import { Team } from '../stages/battle/entities/Team';
import { BattleScene } from '../stages/battle/BattleScene';
import { playerInfos } from '../stages/boot/BootScene';

const snap: PlayerSnapshot = {
    id: '1',
    name: 'toto',
    state: 'init',
    charactersSnapshots: []
};

export const seedPlayer = (
    snapshot: Partial<PlayerSnapshot> = {},
    team: Team,
    battleScene: BattleScene,
    itsMe?: boolean
): Player => {

    const s = {
        ...snap,
        ...snapshot
    };

    if (itsMe) {
        playerInfos.id = s.id;
        playerInfos.name = s.name;
    }

    return new Player(s, team, battleScene);
};
