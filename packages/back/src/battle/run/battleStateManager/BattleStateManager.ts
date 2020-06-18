import { assertIsDefined, BattleSnapshot, equals, getBattleSnapshotWithHash as _getBattleSnapshotWithHash, getOrientationFromTo, PlayerRoom, SpellActionSnapshot, TeamRoom } from '@timeflies/shared';
import { Draft, Immutable, produce } from 'immer';
import { WSSocket } from '../../../transport/ws/WSSocket';
import { IPlayerRoomData } from '../../room/room';
import { createStaticCharacter } from '../createStaticCharacter';
import { Character, characterAlterLife, characterIsAlive, characterToSnapshot } from '../entities/character/Character';
import { Player, playerToSnapshot } from '../entities/player/Player';
import { Spell, spellToSnapshot } from '../entities/spell/Spell';
import { Team, teamToSnapshot } from '../entities/team/Team';

export type BattleState = Immutable<{
    battleHashList: string[];
    teams: Team[];
    players: Player[];
    characters: Character[];
    spells: Spell[];
}>;

export type EntitiesGetter<K extends keyof BattleState = keyof BattleState> = <K2 extends K>(key: K2) => BattleState[ K2 ];

export type BattleStateManager = {
    // battleState: BattleState;
    generateFirstSnapshot(launchTime: number): BattleSnapshot;
    useSpellAction(spellAction: SpellActionSnapshot): {
        onClone(): {
            ifCorrectHash(fn: (hash: string, applyOnCurrentState: () => { deaths: Character[] }) => void): boolean;
        };
    };
    get: EntitiesGetter;
};

interface Dependencies {
    getBattleSnapshotWithHash: typeof _getBattleSnapshotWithHash;
}

export const BattleStateManager = (
    playerDataList: IPlayerRoomData<WSSocket>[],
    teamRoomList: TeamRoom[],
    playerRoomList: PlayerRoom[],
    { getBattleSnapshotWithHash }: Dependencies = { getBattleSnapshotWithHash: _getBattleSnapshotWithHash }
): BattleStateManager => {

    const generateBattleState = (teamRoomList: TeamRoom[]): BattleState => {

        const teams: Team[] = [];
        const players: Player[] = [];
        const characters: Character[] = [];
        const spells: Spell[] = [];

        teamRoomList.forEach(t => {
            teams.push(Team(t));

            t.playersIds.forEach(pId => {
                const { socket } = playerDataList.find(({ id }) => id === pId)!;
                const p = playerRoomList.find(({ id }) => id === pId)!;

                players.push(Player(
                    p,
                    t.id,
                    socket.createPool()));

                p.characters.forEach(c => {
                    const staticData = createStaticCharacter(c.id, c.type);
                    const character = Character(c, staticData, pId);
                    characters.push(character);

                    character.staticData.staticSpells.forEach((s, i) => {
                        spells.push(Spell(s, i, c.id));
                    });
                });
            });
        });

        const battleHashList: string[] = [];

        // const clone = (): InnerBattleState => ({
        //     battleHashList: [ ...battleHashList ],
        //     teams: teams.map(t => ({ ...t })),
        //     players: players.map(p => ({ ...p })),
        //     characters: characters.map(c => ({ ...c })),
        //     spells: spells.map(s => ({ ...s }))
        // });

        return {
            battleHashList,
            teams,
            players,
            characters,
            spells
        };
    };

    const generateSnapshot = ({ teams, players, characters, spells }: Immutable<BattleState>, launchTime: number, time: number): BattleSnapshot => {

        return getBattleSnapshotWithHash({
            time,
            launchTime,
            teamsSnapshots: teams.map(teamToSnapshot),
            playersSnapshots: players.map(playerToSnapshot),
            charactersSnapshots: characters.map(characterToSnapshot),
            spellsSnapshots: spells.map(spellToSnapshot)
        });
    };

    // TODO share all these functions
    const applyMoveAction = (spell: Spell, { position }: SpellActionSnapshot, { characters }: Draft<BattleState>): Character[] => {
        const character = characters.find(c => c.id === spell.characterId)!;

        const orientation = getOrientationFromTo(character.position, position);

        character.position = position;
        character.orientation = orientation;

        return [];
    };

    const applySimpleAttack = (spell: Spell, { actionArea }: SpellActionSnapshot, { characters }: Draft<BattleState>): Character[] => {

        const targets = characters.filter(c => characterIsAlive(c) && actionArea.some(p => equals(p)(c.position)));

        targets.forEach(t => characterAlterLife(t, -spell.features.attack));

        return targets.filter(t => !characterIsAlive(t));
    };

    // const applyDefaultAction = (spell: Spell, positions: Position[]) => {
    //     const targets = characters.filter(({ isAlive, position: p }) => isAlive
    //         && positions.some(p2 =>
    //             p.x === p2.x && p.y === p2.y
    //         ));

    //     const { features: { attack } } = spell;

    //     targets.forEach(t => {
    //         t.features = {
    //             ...t.features,
    //             life: Math.max(t.features.life - attack, 0)
    //         };
    //     });

    //     return targets.filter(t => !t.isAlive);
    // };

    const applySpellAction = (spellAction: SpellActionSnapshot, battleState: Draft<BattleState>): Character[] => {

        const spell = battleState.spells.find(s => s.id === spellAction.spellId);
        assertIsDefined(spell);

        const { staticData: { type } } = spell;

        if (type === 'move') {
            return applyMoveAction(spell, spellAction, battleState);
        } else if (type === 'simpleAttack') {
            return applySimpleAttack(spell, spellAction, battleState);
        } else if (type === 'orientate') {
            // TODO
        } else {
            // TODO
            // this.applyDefaultAction(spell, position);
        }
        return [];
    };

    const useSpellAction = (spellAction: SpellActionSnapshot) => {

        return {
            onClone: () => {
                const tempNextBattleState = produce(currentBattleState, draftBattleState => {
                    applySpellAction(spellAction, draftBattleState);
                });

                const snapshotClone = produce(tempNextBattleState, draftBattleState => {
                    return generateSnapshot(draftBattleState, -1, -1);
                });

                // const nextBattleState = produce(tempNextBattleState, draftBattleState => {
                //     draftBattleState.battleHashList.push(snapshotClone.battleHash);
                // });

                // const snapshotClone = generateSnapshot(cloneBattleState, -1, -1);

                return {
                    ifCorrectHash: (fn: (hash: string, applyOnCurrentState: () => { deaths: Character[] }) => void) => {
                        if (snapshotClone.battleHash === spellAction.battleHash) {

                            fn(snapshotClone.battleHash, () => {
                                let deaths: Character[] = [];
                                currentBattleState = produce(currentBattleState, draftBattleState => {
                                    draftBattleState.battleHashList.push(snapshotClone.battleHash);
                                    deaths = applySpellAction(spellAction, draftBattleState);
                                });
                                return { deaths };
                            });
                            return true;
                        }
                        console.log('BAD HASH !');
                        console.log('expected:', snapshotClone.battleHash);
                        console.log('received:', spellAction.battleHash);
                        // console.log('characters life/position', ...snapshotClone.charactersSnapshots.flatMap(c => [ c.features.life, c.position.x, c.position.y, ' | ' ]))
                        return false;
                    }
                };
            }
        };
    };

    const generateFirstSnapshot = (launchTime: number) => {
        const snapshot = generateSnapshot(currentBattleState, launchTime, launchTime);

        currentBattleState = produce(currentBattleState, draftBattleState => {
            draftBattleState.battleHashList.push(snapshot.battleHash);
        });

        return snapshot;
    };

    let currentBattleState = generateBattleState(teamRoomList);

    return {
        // get battleState() { return currentBattleState },
        generateFirstSnapshot,
        useSpellAction,
        get: (key) => currentBattleState[ key ]
    };
};
