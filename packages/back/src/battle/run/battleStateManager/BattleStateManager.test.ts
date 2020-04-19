import { SpellActionSnapshot } from '@timeflies/shared';
import { seedStaticCharacter } from '../entities/seedStaticCharacter';
import { seedTeam } from '../entities/team/Team.seed';
import { BattleState, BattleStateManager } from './BattleStateManager';
import util from 'util';

describe('# BattleStateManager', () => {

    it('should correctly init battle state', () => {

        const teams = [ seedTeam() ];
        const players = teams.flatMap(t => t.players);
        const characters = players.flatMap(p => p.characters);
        const spells = characters.flatMap(c => c.spells);

        const manager = BattleStateManager(teams);

        expect(manager.battleState).toMatchObject<BattleState>({
            teams, players, characters, spells,
            battleHashList: []
        });
    });

    it('should return correct first snapshot', () => {

        const teams = [ seedTeam() ];

        const manager = BattleStateManager(teams, {
            getBattleSnapshotWithHash: () => ({
                launchTime: -1,
                time: -1,
                teamsSnapshots: [],
                battleHash: 'hash'
            })
        });

        const snap = manager.generateFirstSnapshot(100);

        expect(snap).toEqual({
            launchTime: -1,
            time: -1,
            teamsSnapshots: [],
            battleHash: 'hash'
        });
        expect(manager.battleState.battleHashList).toEqual([ 'hash' ]);
    });

    describe('on spell action', () => {

        it('should not call callback on bad hash', () => {

            const teams = [ seedTeam({
                players: [ {
                    id: 'p1',
                    name: '',
                    state: 'battle-ready',
                    socket: null as any,
                    staticCharacters: [ seedStaticCharacter()[ 0 ] ]
                } ]
            }) ];

            const manager = BattleStateManager(teams, {
                getBattleSnapshotWithHash: () => ({
                    launchTime: -1,
                    time: -1,
                    teamsSnapshots: [],
                    battleHash: 'hash'
                })
            });

            const firstState = util.inspect(manager.battleState);

            const character = teams[ 0 ].characters[ 0 ];
            const spell = character.spells[ 0 ];

            const spellAction: SpellActionSnapshot = {
                spellId: spell.id,
                characterId: character.id,
                battleHash: 'bad-hash',
                startTime: -1,
                actionArea: [ { x: -1, y: -1 } ],
                duration: 200,
                fromNotify: false,
                position: { x: -1, y: -1 },
                validated: false
            };

            const callback = jest.fn();

            const succeed = manager.useSpellAction(spellAction)
                .onClone()
                .ifCorrectHash(callback);

            expect(callback).not.toHaveBeenCalled();
            expect(succeed).toBe(false);
            expect(util.inspect(manager.battleState)).toBe(firstState);
        });

        it('should call callback on correct hash', () => {

            const teams = [ seedTeam({
                players: [ {
                    id: 'p1',
                    name: '',
                    state: 'battle-ready',
                    socket: null as any,
                    staticCharacters: [ seedStaticCharacter()[ 0 ] ]
                } ]
            }) ];

            const manager = BattleStateManager(teams, {
                getBattleSnapshotWithHash: () => ({
                    launchTime: -1,
                    time: -1,
                    teamsSnapshots: [],
                    battleHash: 'hash'
                })
            });

            const firstState = util.inspect(manager.battleState);

            const character = teams[ 0 ].characters[ 0 ];
            const spell = character.spells[ 0 ];

            const spellAction: SpellActionSnapshot = {
                spellId: spell.id,
                characterId: character.id,
                battleHash: 'hash',
                startTime: -1,
                actionArea: [ { x: -1, y: -1 } ],
                duration: 200,
                fromNotify: false,
                position: { x: -1, y: -1 },
                validated: false
            };

            const callback = jest.fn();

            const succeed = manager.useSpellAction(spellAction)
                .onClone()
                .ifCorrectHash(callback);

            expect(callback).toHaveBeenNthCalledWith(1, 'hash', expect.any(Function));
            expect(succeed).toBe(true);
            expect(util.inspect(manager.battleState)).toBe(firstState);
        });

        it('should change battle state on callback function called', () => {

            const teams = [ seedTeam({
                players: [ {
                    id: 'p1',
                    name: '',
                    state: 'battle-ready',
                    socket: null as any,
                    staticCharacters: [ seedStaticCharacter()[ 0 ] ]
                } ]
            }) ];

            const manager = BattleStateManager(teams, {
                getBattleSnapshotWithHash: () => ({
                    launchTime: -1,
                    time: -1,
                    teamsSnapshots: [],
                    battleHash: 'hash'
                })
            });

            const firstState = util.inspect(manager.battleState);

            const character = teams[ 0 ].characters[ 0 ];
            const spell = character.spells[ 0 ];

            const spellAction: SpellActionSnapshot = {
                spellId: spell.id,
                characterId: character.id,
                battleHash: 'hash',
                startTime: -1,
                actionArea: [ { x: -1, y: -1 } ],
                duration: 200,
                fromNotify: false,
                position: { x: -1, y: -1 },
                validated: false
            };

            let applyReturn = undefined;

            manager.useSpellAction(spellAction)
                .onClone()
                .ifCorrectHash((hash, applyOnCurrentState) => {

                    applyReturn = applyOnCurrentState();

                });

            expect(applyReturn).toEqual({ deaths: expect.any(Array) });
            expect(util.inspect(manager.battleState)).not.toBe(firstState);
        });

    });

});
