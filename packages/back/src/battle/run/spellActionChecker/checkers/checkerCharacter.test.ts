import { SpellActionCAction } from '@timeflies/shared';
import { seedCycle } from '../../cycle/Cycle.seed';
import { seedPlayer } from '../../entities/player/Player.seed';
import { seedMapManager } from '../../mapManager/MapManager.seed';
import { CharActionCheckerResult } from '../SpellActionChecker';
import { checkerCharacter } from './checkerCharacter';

describe('# checkerCharacter', () => {

    it('should fail if character is dead', () => {

        const player = seedPlayer({
            staticCharacters: [ {
                id: 'test',
                defaultSpellId: 's1',
                initialFeatures: {
                    life: 0,
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

        const cycle = seedCycle({ turn: { character } });

        const mapManager = seedMapManager();

        const checker = checkerCharacter(cycle, mapManager);

        const spellAction: SpellActionCAction = {
            type: 'battle/spellAction',
            sendTime: -1,
            spellAction: {
                characterId: 'other',
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
            reason: 'isAlive'
        });
    });

    it('should fail on bad spell id', () => {

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

        const cycle = seedCycle({ turn: { character } });

        const mapManager = seedMapManager();

        const checker = checkerCharacter(cycle, mapManager);

        const spellAction: SpellActionCAction = {
            type: 'battle/spellAction',
            sendTime: -1,
            spellAction: {
                characterId: 'other',
                actionArea: [],
                battleHash: '',
                duration: 200,
                fromNotify: false,
                position: { x: -1, y: -1 },
                spellId: 'bad-id',
                startTime: -1,
                validated: false
            }
        };

        expect(checker(spellAction, player)).toEqual<CharActionCheckerResult>({
            success: false,
            reason: 'spell'
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
                    initialFeatures: {} as any
                } ],
                type: 'sampleChar1'
            } ]
        });

        const character = player.characters[ 0 ];

        const cycle = seedCycle({ turn: { character } });

        const mapManager = seedMapManager();

        const checker = checkerCharacter(cycle, mapManager);

        const spellAction: SpellActionCAction = {
            type: 'battle/spellAction',
            sendTime: -1,
            spellAction: {
                characterId: 'other',
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

        expect(checker(spellAction, player)).toEqual<CharActionCheckerResult>({ success: true });
    });

});
