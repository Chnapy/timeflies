import 'phaser';
import { PlayerSnapshot } from '@timeflies/shared';
import { Player } from '../phaser/entities/Player';
import { Team } from '../phaser/entities/Team';
import { BattleScene } from '../phaser/scenes/BattleScene';
import { playerInfos } from '../phaser/scenes/BootScene';

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
