import { MapConfig, Position, SpellActionCAction, TimerTester } from "@timeflies/shared";
import fs from 'fs';
import { TiledMapOrthogonal } from "tiled-types/types";
import { Cycle } from "./cycle/Cycle";
import { Character } from "./entities/character/Character";
import { seedCharacter } from "./entities/character/Character.seed";
import { seedPlayer } from "./entities/player/Player.seed";
import { Spell } from "./entities/spell/Spell";
import { MapManager } from "./mapManager/MapManager";
import { CharActionCheckerResult, SpellActionChecker } from "./SpellActionChecker";
jest.mock('fs');

describe('# SpellActionChecker', () => {

    const timerTester = new TimerTester();

    let cycle: Cycle;
    let character: Character;
    let spellDefault: Spell;
    let charPos: Position;
    let checker: SpellActionChecker;

    const getCycle = (): Cycle => {

        const players = [ seedPlayer() ];
        const characters = seedCharacter({
            length: 2
        }, () => players[ 0 ]);

        return Cycle({ players, characters });
    };

    const getMap = (): MapManager => {

        const width = 20, height = 20;

        const obstaclesData: number[] = [];

        for (let i = 0; i < width * height; i++) {

            let v = 0;
            if (i === width * 12 + 10) {
                v = 1;
            }

            obstaclesData.push(v);
        }

        const schema: TiledMapOrthogonal = {
            width,
            height,
            layers: [
                {
                    name: 'init',
                    type: 'tilelayer',
                    width,
                    height,
                    data: [],

                },
                {
                    name: 'decor',
                    type: 'tilelayer',
                    width,
                    height,
                    data: []
                },
                {
                    name: 'obstacles',
                    type: 'tilelayer',
                    width,
                    height,
                    data: obstaclesData
                }
            ]
        } as any;

        (fs as any).__setMockFiles({
            'public/schema': JSON.stringify(schema)
        })

        const mapConfig: MapConfig = {
            id: 'm-1',
            schemaUrl: 'schema',
            defaultTilelayerName: 'decor',
            initLayerName: 'init',
            obstacleTilelayerName: 'obstacles'
        };

        return MapManager(mapConfig);
    };

    beforeEach(() => {
        timerTester.beforeTest();

        cycle = getCycle();
        const map = getMap();
        cycle.start(Date.now());

        character = cycle.globalTurn.currentTurn.character;
        character.position = { x: 10, y: 10 };
        const character2 = cycle.globalTurn.charactersOrdered[ 1 ];
        character2.position = { x: 9, y: 10 };
        spellDefault = character.spells.find(s => s.staticData.type !== 'move' && s.staticData.type !== 'orientate')!;
        charPos = character.position;
        checker = SpellActionChecker(cycle, map);
    });

    afterEach(() => {
        timerTester.afterTest();
    });

    it('should fail on dead character', () => {

        const position = {
            ...charPos,
            x: charPos.x + 1
        };

        const action: SpellActionCAction = {
            type: 'battle/spellAction',
            sendTime: Date.now(),
            spellAction: {
                spellId: spellDefault.id,
                battleHash: '',
                characterId: character.id,
                duration: spellDefault.features.duration,
                startTime: Date.now(),
                fromNotify: false,
                validated: false,
                position,
                actionArea: [ position ]
            }
        };

        character.features = {
            ...character.features,
            life: 0
        };

        expect(
            checker.check(action, character.player)
        ).toStrictEqual<CharActionCheckerResult>({
            success: false,
            reason: 'isAlive'
        });
    });

    it('should fail on bad spell ID', () => {

        const position = {
            ...charPos,
            x: charPos.x + 1
        };

        const action: SpellActionCAction = {
            type: 'battle/spellAction',
            sendTime: Date.now(),
            spellAction: {
                spellId: '-1',
                battleHash: '',
                characterId: character.id,
                duration: spellDefault.features.duration,
                startTime: Date.now(),
                fromNotify: false,
                validated: false,
                position,
                actionArea: [ position ]
            }
        };

        expect(
            checker.check(action, character.player)
        ).toStrictEqual<CharActionCheckerResult>({
            success: false,
            reason: 'spell'
        });
    });

    it('should fail on bad send time: too early', () => {

        const position = {
            ...charPos,
            x: charPos.x + 1
        };

        const action: SpellActionCAction = {
            type: 'battle/spellAction',
            sendTime: Date.now() - 10000,
            spellAction: {
                spellId: spellDefault.id,
                battleHash: '',
                characterId: character.id,
                duration: spellDefault.features.duration,
                startTime: Date.now(),
                fromNotify: false,
                validated: false,
                position,
                actionArea: [ position ]
            }
        };

        expect(
            checker.check(action, character.player)
        ).toStrictEqual<CharActionCheckerResult>({
            success: false,
            reason: 'startTime'
        });
    });

    it('should fail on bad send time: too late', () => {

        const position = {
            ...charPos,
            x: charPos.x + 1
        };

        const action: SpellActionCAction = {
            type: 'battle/spellAction',
            sendTime: Date.now() + cycle.globalTurn.currentTurn.turnDuration - 10,
            spellAction: {
                spellId: spellDefault.id,
                battleHash: '',
                characterId: character.id,
                duration: spellDefault.features.duration,
                startTime: Date.now(),
                fromNotify: false,
                validated: false,
                position,
                actionArea: [ position ]
            }
        };

        expect(
            checker.check(action, character.player)
        ).toStrictEqual<CharActionCheckerResult>({
            success: false,
            reason: 'duration'
        });
    });

    // it('should fail on bad position: area', () => {

    //     spellDefault.features.area = 3;

    //     const action: CharActionCAction = {
    //         type: 'charAction',
    //         sendTime: Date.now(),
    //         charAction: {
    //             spellId: spellDefault.id,
    //             positions: [{
    //                 ...charPos,
    //                 x: charPos.x + 4
    //             }]
    //         }
    //     };

    //     expect(
    //         checker.check(action, character.player)
    //     ).toStrictEqual<CharActionCheckerResult>({
    //         success: false,
    //         reason: 'isInArea'
    //     });
    // });

    // it('should fail on bad position: obstacles', () => {

    //     spellDefault.features.area = 20;

    //     const action: CharActionCAction = {
    //         type: 'charAction',
    //         sendTime: Date.now(),
    //         charAction: {
    //             spellId: spellDefault.id,
    //             positions: [{
    //                 ...charPos,
    //                 y: charPos.y + 4
    //             }]
    //         }
    //     };

    //     expect(
    //         checker.check(action, character.player)
    //     ).toStrictEqual<CharActionCheckerResult>({
    //         success: false,
    //         reason: 'bresenham'
    //     });
    // });

    // it('should fail on specific type: move', () => {

    //     const action: CharActionCAction = {
    //         type: 'charAction',
    //         sendTime: Date.now(),
    //         charAction: {
    //             spellId: spellMove.id,
    //             positions: [{
    //                 ...charPos,
    //                 x: charPos.x - 1
    //             }]
    //         }
    //     };

    //     // can't step to an occupied tile
    //     expect(
    //         checker.check(action, character.player)
    //     ).toStrictEqual<CharActionCheckerResult>({
    //         success: false,
    //         reason: 'specificType'
    //     });
    // });

    // it('should fail on specific type: default spell', () => {

    //     const position = {
    //         ...charPos,
    //         x: charPos.x - 2
    //     };

    //     const action: SpellActionCAction = {
    //         type: 'battle/spellAction',
    //         sendTime: Date.now(),
    //         spellAction: {
    //             spellId: spellDefault.id,
    //             battleHash: '',
    //             characterId: character.id,
    //             duration: spellDefault.features.duration,
    //             startTime: Date.now(),
    //             fromNotify: false,
    //             validated: false,
    //             position,
    //             actionArea: [ position ]
    //         }
    //     };

    //     // can't go through an occupied tile
    //     expect(
    //         checker.check(action, character.player)
    //     ).toStrictEqual<CharActionCheckerResult>({
    //         success: false,
    //         reason: 'specificType'
    //     });
    // });

    it('should fail on bad player', () => {

        const otherPlayer = seedPlayer();

        const position = {
            x: 10,
            y: 10
        };

        const action: SpellActionCAction = {
            type: 'battle/spellAction',
            sendTime: Date.now(),
            spellAction: {
                spellId: spellDefault.id,
                battleHash: '',
                characterId: character.id,
                duration: spellDefault.features.duration,
                startTime: Date.now(),
                fromNotify: false,
                validated: false,
                position,
                actionArea: [ position ]
            }
        };

        expect(
            checker.check(action, otherPlayer)
        ).toStrictEqual<CharActionCheckerResult>({
            success: false,
            reason: 'player'
        });
    });

    it('should succeed with good data', () => {

        const position = {
            ...charPos,
            x: charPos.x + 1
        };

        const action: SpellActionCAction = {
            type: 'battle/spellAction',
            sendTime: Date.now(),
            spellAction: {
                spellId: spellDefault.id,
                battleHash: '',
                characterId: character.id,
                duration: spellDefault.features.duration,
                startTime: Date.now(),
                fromNotify: false,
                validated: false,
                position,
                actionArea: [ position ]
            }
        };

        expect(
            checker.check(action, character.player)
        ).toStrictEqual<CharActionCheckerResult>({ success: true });
    });

});
