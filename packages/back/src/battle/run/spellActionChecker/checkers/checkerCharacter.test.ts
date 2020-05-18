import { SpellActionCAction, seedSpellActionSnapshot } from '@timeflies/shared';
import { seedCycle } from '../../cycle/Cycle.seed';
import { seedPlayer } from '../../entities/player/Player.seed';
import { seedMapManager } from '../../mapManager/MapManager.seed';
import { CharActionCheckerResult } from '../SpellActionChecker';
import { checkerCharacter } from './checkerCharacter';

describe('# checkerCharacter', () => {

    it('should fail if character is dead', () => {

        const player = seedPlayer({
            staticCharacters: [ {
                staticData: {
                    id: 'test',
                    defaultSpellId: 's1',
                    initialFeatures: {
                        life: 0,
                        actionTime: 200,
                    },
                    name: '',
                    staticSpells: [ {
                        id: 's1',
                        name: '',
                        type: 'move',
                        initialFeatures: {} as any
                    } ],
                    type: 'sampleChar1'
                },
                initialPosition: { x: 0, y: 0 }
            } ]
        });

        const character = player.characters[ 0 ];

        const cycle = seedCycle({ turn: { character } });

        const mapManager = seedMapManager();

        const checker = checkerCharacter(cycle, mapManager);

        const spellAction: SpellActionCAction = {
            type: 'battle/spellAction',
            sendTime: -1,
            spellAction: seedSpellActionSnapshot(character.spells[ 0 ].id, {
                characterId: 'other',
                duration: 200,
            })
        };

        expect(checker(spellAction, player)).toEqual<CharActionCheckerResult>({
            success: false,
            reason: 'isAlive'
        });
    });

    it('should fail on bad spell id', () => {

        const player = seedPlayer({
            staticCharacters: [ {
                staticData: {
                    id: 'test',
                    defaultSpellId: 's1',
                    initialFeatures: {
                        life: 100,
                        actionTime: 200,
                    },
                    name: '',
                    staticSpells: [ {
                        id: 's1',
                        name: '',
                        type: 'move',
                        initialFeatures: {} as any
                    } ],
                    type: 'sampleChar1'
                },
                initialPosition: { x: 0, y: 0 }
            } ]
        });

        const character = player.characters[ 0 ];

        const cycle = seedCycle({ turn: { character } });

        const mapManager = seedMapManager();

        const checker = checkerCharacter(cycle, mapManager);

        const spellAction: SpellActionCAction = {
            type: 'battle/spellAction',
            sendTime: -1,
            spellAction: seedSpellActionSnapshot('bad-id', {
                characterId: 'other',
            })
        };

        expect(checker(spellAction, player)).toEqual<CharActionCheckerResult>({
            success: false,
            reason: 'spell'
        });
    });

    it('should succeed else', () => {

        const player = seedPlayer({
            staticCharacters: [ {
                staticData: {
                    id: 'test',
                    defaultSpellId: 's1',
                    initialFeatures: {
                        life: 100,
                        actionTime: 200,
                    },
                    name: '',
                    staticSpells: [ {
                        id: 's1',
                        name: '',
                        type: 'move',
                        initialFeatures: {} as any
                    } ],
                    type: 'sampleChar1'
                },
                initialPosition: { x: 0, y: 0 }
            } ]
        });

        const character = player.characters[ 0 ];

        const cycle = seedCycle({ turn: { character } });

        const mapManager = seedMapManager();

        const checker = checkerCharacter(cycle, mapManager);

        const spellAction: SpellActionCAction = {
            type: 'battle/spellAction',
            sendTime: -1,
            spellAction: seedSpellActionSnapshot(character.spells[ 0 ].id, {
                characterId: 'other',
            })
        };

        expect(checker(spellAction, player)).toEqual<CharActionCheckerResult>({ success: true });
    });

});
