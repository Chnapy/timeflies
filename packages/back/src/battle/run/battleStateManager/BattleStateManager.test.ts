import { SpellActionSnapshot, seedSpellActionSnapshot } from '@timeflies/shared';
import { seedStaticCharacter } from '../entities/seedStaticCharacter';
import { seedTeam } from '../entities/team/Team.seed';
import { BattleState, BattleStateManager } from './BattleStateManager';
import util from 'util';
import { seedWebSocket } from '../../../transport/ws/WSSocket.seed';
import { WSSocket } from '../../../transport/ws/WSSocket';

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

            const { ws } = seedWebSocket();

            const teams = [ seedTeam({
                players: [ {
                    id: 'p1',
                    name: '',
                    socket: new WSSocket(ws).createPool(),
                    staticCharacters: [ {
                        staticData: seedStaticCharacter()[ 0 ],
                        initialPosition: { x: 0, y: 0 }
                    } ]
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

            const spellAction: SpellActionSnapshot = seedSpellActionSnapshot(spell.id, {
                characterId: character.id,
                battleHash: 'bad-hash',
                duration: 200,
            });

            const callback = jest.fn();

            const succeed = manager.useSpellAction(spellAction)
                .onClone()
                .ifCorrectHash(callback);

            expect(callback).not.toHaveBeenCalled();
            expect(succeed).toBe(false);
            expect(util.inspect(manager.battleState)).toBe(firstState);
        });

        it('should call callback on correct hash', () => {

            const { ws } = seedWebSocket();

            const teams = [ seedTeam({
                players: [ {
                    id: 'p1',
                    name: '',
                    socket: new WSSocket(ws).createPool(),
                    staticCharacters: [ {
                        staticData: seedStaticCharacter()[ 0 ],
                        initialPosition: { x: 0, y: 0 }
                    } ]
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

            const spellAction: SpellActionSnapshot = seedSpellActionSnapshot(spell.id, {
                characterId: character.id,
                battleHash: 'hash',
                actionArea: [ { x: -1, y: -1 } ],
                duration: 200,
            });

            const callback = jest.fn();

            const succeed = manager.useSpellAction(spellAction)
                .onClone()
                .ifCorrectHash(callback);

            expect(callback).toHaveBeenNthCalledWith(1, 'hash', expect.any(Function));
            expect(succeed).toBe(true);
            expect(util.inspect(manager.battleState)).toBe(firstState);
        });

        it('should change battle state on callback function called', () => {

            const { ws } = seedWebSocket();

            const teams = [ seedTeam({
                players: [ {
                    id: 'p1',
                    name: '',
                    socket: new WSSocket(ws).createPool(),
                    staticCharacters: [ {
                        staticData: seedStaticCharacter()[ 0 ],
                        initialPosition: { x: 0, y: 0 }
                    } ]
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

            const spellAction: SpellActionSnapshot = seedSpellActionSnapshot(spell.id, {
                characterId: character.id,
                battleHash: 'hash',
                actionArea: [ { x: -1, y: -1 } ],
                duration: 200,
            });

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
