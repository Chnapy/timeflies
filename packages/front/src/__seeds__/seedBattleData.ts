import { BattleScene } from '../stages/battle/BattleScene';
import { BattleData } from "../BattleData";
import { seedCharacter } from './seedCharacter';
import { seedPlayer } from './seedPlayer';
import { seedTeam } from './seedTeam';
jest.mock('../phaser/scenes/BattleScene');

export const seedBattleData = (data: Partial<BattleData> = {}): BattleData => {

    const battleScene = new BattleScene();

    const teams = [
        seedTeam({
            id: 'T-1',
            name: 'Team-1'
        }, battleScene),
        seedTeam({
            id: 'T-2',
            name: 'Team-2'
        }, battleScene)
    ];

    const players = [
        seedPlayer({
            id: 'P-1',
            name: 'Player-1'
        }, teams[ 0 ], battleScene, true),
        seedPlayer({
            id: 'P-2',
            name: 'Player-2'
        }, teams[ 1 ], battleScene)
    ];

    const characters = [
        seedCharacter({
            staticData: {
                id: 'char-1'
            },
            player: players[0]
        }),
        seedCharacter({
            staticData: {
                id: 'char-2'
            },
            player: players[1]
        })
    ];

    return {
        launchTime: Date.now(),
        teams,
        players,
        characters,
        ...data
    };
};