import { PlayerRoom, seedSpellActionSnapshot, SpellActionSnapshot, TeamRoom } from '@timeflies/shared';
import util from 'util';
import { WSSocket } from '../../../transport/ws/WSSocket';
import { seedWebSocket } from '../../../transport/ws/WSSocket.seed';
import { IPlayerRoomData } from '../../room/room';
import { BattleState, BattleStateManager } from './BattleStateManager';

describe('# BattleStateManager', () => {

    const getInitData = () => {
        const playerDataList: IPlayerRoomData<WSSocket>[] = [
            {
                id: 'p1',
                name: 'p1',
                socket: new WSSocket(seedWebSocket().ws)
            }
        ];
        const teamRoomList: TeamRoom[] = [ {
            id: 't1',
            letter: 'A',
            playersIds: [ 'p1' ]
        } ];
        const playerRoomList: PlayerRoom[] = [ {
            id: 'p1',
            name: 'p1',
            characters: [
                {
                    id: 'c1',
                    type: 'sampleChar1',
                    position: { x: 0, y: 0 }
                }
            ]
        } as PlayerRoom ];

        return { playerDataList, playerRoomList, teamRoomList };
    };

    it('should correctly init battle state', () => {
        const { playerDataList, teamRoomList, playerRoomList } = getInitData();

        const manager = BattleStateManager(playerDataList, teamRoomList, playerRoomList);

        expect(manager.battleState).toMatchObject<BattleState>({
            teams: [ {
                id: 't1',
                letter: 'A'
            } ],
            players: [ {
                id: 'p1',
                name: 'p1',
                teamId: 't1',
                socket: expect.anything()
            } ],
            characters: [ expect.objectContaining({
                id: 'c1'
            }) ],
            spells: expect.any(Array),
            battleHashList: []
        });
    });

    it('should return correct first snapshot', () => {
        const { playerDataList, teamRoomList, playerRoomList } = getInitData();

        const manager = BattleStateManager(playerDataList, teamRoomList, playerRoomList, {
            getBattleSnapshotWithHash: () => ({
                launchTime: -1,
                time: -1,
                teamsSnapshots: [],
                battleHash: 'hash',
                charactersSnapshots: [],
                playersSnapshots: [],
                spellsSnapshots: []
            })
        });

        const snap = manager.generateFirstSnapshot(100);

        expect(snap).toEqual({
            launchTime: -1,
            time: -1,
            teamsSnapshots: [],
            charactersSnapshots: [],
            playersSnapshots: [],
            spellsSnapshots: [],
            battleHash: 'hash'
        });
        expect(manager.battleState.battleHashList).toEqual([ 'hash' ]);
    });

    describe('on spell action', () => {

        it('should not call callback on bad hash', () => {
            const { playerDataList, teamRoomList, playerRoomList } = getInitData();

            const manager = BattleStateManager(playerDataList, teamRoomList, playerRoomList, {
                getBattleSnapshotWithHash: () => ({
                    launchTime: -1,
                    time: -1,
                    teamsSnapshots: [],
                    charactersSnapshots: [],
                    playersSnapshots: [],
                    spellsSnapshots: [],
                    battleHash: 'hash'
                })
            });

            const firstState = util.inspect(manager.battleState);
            
            const spell = manager.battleState.spells[0];

            const spellAction: SpellActionSnapshot = seedSpellActionSnapshot(spell.id, {
                characterId: spell.characterId,
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
            const { playerDataList, teamRoomList, playerRoomList } = getInitData();

            const manager = BattleStateManager(playerDataList, teamRoomList, playerRoomList, {
                getBattleSnapshotWithHash: () => ({
                    launchTime: -1,
                    time: -1,
                    teamsSnapshots: [],
                    charactersSnapshots: [],
                    playersSnapshots: [],
                    spellsSnapshots: [],
                    battleHash: 'hash'
                })
            });

            const firstState = util.inspect(manager.battleState);

            const spell = manager.battleState.spells[0];

            const spellAction: SpellActionSnapshot = seedSpellActionSnapshot(spell.id, {
                characterId: spell.characterId,
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
            const { playerDataList, teamRoomList, playerRoomList } = getInitData();

            const manager = BattleStateManager(playerDataList, teamRoomList, playerRoomList, {
                getBattleSnapshotWithHash: () => ({
                    launchTime: -1,
                    time: -1,
                    teamsSnapshots: [],
                    charactersSnapshots: [],
                    playersSnapshots: [],
                    spellsSnapshots: [],
                    battleHash: 'hash'
                })
            });

            const firstState = util.inspect(manager.battleState);

            const spell = manager.battleState.spells[0];

            const spellAction: SpellActionSnapshot = seedSpellActionSnapshot(spell.id, {
                characterId: spell.characterId,
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
