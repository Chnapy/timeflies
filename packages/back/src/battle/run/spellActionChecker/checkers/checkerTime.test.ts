import { SpellActionCAction } from '@timeflies/shared';
import { seedCycle } from '../../cycle/Cycle.seed';
import { seedPlayer } from '../../entities/player/Player.seed';
import { seedMapManager } from '../../mapManager/MapManager.seed';
import { CharActionCheckerResult } from '../SpellActionChecker';
import { checkerTime } from './checkerTime';

describe('# checkerTime', () => {

    it('should fail on bad start time', () => {

        const player = seedPlayer({
            staticCharacters: [ {
                id: 'test',
                defaultSpellId: 's1',
                initialFeatures: {
                    life: 100,
                    actionTime: 200,
                },
                name: '',
                staticSpells: [ {
                    id: 's1',
                    color: '',
                    name: '',
                    type: 'move',
                    initialFeatures: {} as any
                } ],
                type: 'sampleChar1'
            } ]
        });

        const character = player.characters[ 0 ];

        const cycle = seedCycle({
            turn: {
                startTime: 200,
                character
            }
        });

        const mapManager = seedMapManager();

        const checker = checkerTime(cycle, mapManager);

        const spellAction: SpellActionCAction = {
            type: 'battle/spellAction',
            sendTime: 100,
            spellAction: {
                characterId: character.id,
                actionArea: [],
                battleHash: '',
                duration: 200,
                fromNotify: false,
                position: { x: -1, y: -1 },
                spellId: character.spells[ 0 ].id,
                startTime: -1,
                validated: false
            }
        };

        expect(checker(spellAction, player)).toEqual<CharActionCheckerResult>({
            success: false,
            reason: 'startTime'
        });
    });

    it('should fail on duration too long', () => {

        const player = seedPlayer({
            staticCharacters: [ {
                id: 'test',
                defaultSpellId: 's1',
                initialFeatures: {
                    life: 100,
                    actionTime: 200,
                },
                name: '',
                staticSpells: [ {
                    id: 's1',
                    color: '',
                    name: '',
                    type: 'move',
                    initialFeatures: {
                        duration: 1000,
                        area: 1,
                        attack: -1
                    }
                } ],
                type: 'sampleChar1'
            } ]
        });

        const character = player.characters[ 0 ];

        const cycle = seedCycle({
            turn: {
                startTime: 200,
                turnDuration: 900,
                endTime: 1100,
                character
            }
        });

        const mapManager = seedMapManager();

        const checker = checkerTime(cycle, mapManager);

        const spellAction: SpellActionCAction = {
            type: 'battle/spellAction',
            sendTime: 201,
            spellAction: {
                characterId: character.id,
                actionArea: [],
                battleHash: '',
                duration: -1,
                fromNotify: false,
                position: { x: -1, y: -1 },
                spellId: character.spells[ 0 ].id,
                startTime: -1,
                validated: false
            }
        };

        expect(checker(spellAction, player)).toEqual<CharActionCheckerResult>({
            success: false,
            reason: 'duration'
        });
    });

    it('should succeed else', () => {

        const player = seedPlayer({
            staticCharacters: [ {
                id: 'test',
                defaultSpellId: 's1',
                initialFeatures: {
                    life: 100,
                    actionTime: 200,
                },
                name: '',
                staticSpells: [ {
                    id: 's1',
                    color: '',
                    name: '',
                    type: 'move',
                    initialFeatures: {
                        duration: 1000,
                        area: 1,
                        attack: -1
                    }
                } ],
                type: 'sampleChar1'
            } ]
        });

        const character = player.characters[ 0 ];

        const cycle = seedCycle({
            turn: {
                startTime: 200,
                turnDuration: 1100,
                endTime: 1300,
                character
            }
        });

        const mapManager = seedMapManager();

        const checker = checkerTime(cycle, mapManager);

        const spellAction: SpellActionCAction = {
            type: 'battle/spellAction',
            sendTime: 201,
            spellAction: {
                characterId: character.id,
                actionArea: [],
                battleHash: '',
                duration: -1,
                fromNotify: false,
                position: { x: -1, y: -1 },
                spellId: character.spells[ 0 ].id,
                startTime: -1,
                validated: false
            }
        };

        expect(checker(spellAction, player)).toEqual<CharActionCheckerResult>({ success: true });
    });
});
