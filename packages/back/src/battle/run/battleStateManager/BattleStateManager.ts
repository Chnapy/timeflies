import { assertIsDefined, BattleSnapshot, getBattleSnapshotWithHash as _getBattleSnapshotWithHash, getOrientationFromTo, PlayerRoom, SpellActionSnapshot, TeamRoom } from '@timeflies/shared';
import { Draft, Immutable, produce } from 'immer';
import { WSSocket } from '../../../transport/ws/WSSocket';
import { IPlayerRoomData } from '../../room/room';
import { createStaticCharacter } from '../createStaticCharacter';
import { Character, characterAlterLife, characterIsAlive, characterToSnapshot } from '../entities/character/Character';
import { Player } from '../entities/player/Player';
import { Spell, spellToSnapshot } from '../entities/spell/Spell';
import { Team } from '../entities/team/Team';

export type BattleState = Immutable<{
    battleHashList: string[];
    characters: Character[];
    spells: Spell[];
}>;

export type EntitiesGetter<K extends keyof BattleState = keyof BattleState> = <K2 extends K>(key: K2) => BattleState[ K2 ];

export type BattleStateManager = {
    playerList: Player[];
    teamList: Team[];
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
    playerDataList: Immutable<IPlayerRoomData<WSSocket>[]>,
    teamRoomList: Immutable<TeamRoom[]>,
    playerRoomList: PlayerRoom[],
    { getBattleSnapshotWithHash }: Dependencies = { getBattleSnapshotWithHash: _getBattleSnapshotWithHash }
): BattleStateManager => {

    const teamList = teamRoomList.map(({ id, letter }): Team => ({
        id, letter
    }));

    const playerList = teamRoomList.flatMap(t => t.playersIds.map(pId => {
        const { socket } = playerDataList.find(({ id }) => id === pId)!;
        const p = playerRoomList.find(({ id }) => id === pId)!;

        return Player(
            p,
            t.id,
            socket.createPool());
    }));

    const generateBattleState = (): BattleState => {

        const characters: Character[] = playerList.flatMap(({ id: pId }) => {
            const p = playerRoomList.find(({ id }) => id === pId)!;

            return p.characters.map(c => {
                const staticData = createStaticCharacter(c.id, c.type);

                return Character(c, staticData, pId);
            });
        });

        const spells: Spell[] = characters.flatMap(({ id: cId, staticData }) =>
            staticData.staticSpells.map((s, i) => Spell(s, i, cId))
        );

        const battleHashList: string[] = [];

        return {
            battleHashList,
            characters,
            spells
        };
    };

    const generateSnapshot = ({ characters, spells }: Immutable<BattleState>, launchTime: number, time: number): BattleSnapshot => {

        return getBattleSnapshotWithHash({
            time,
            launchTime,
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

        const targets = characters.filter(c => characterIsAlive(c) && !!actionArea[c.position.id]);

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

    let currentBattleState = generateBattleState();

    return {
        teamList,
        playerList,
        generateFirstSnapshot,
        useSpellAction,
        get: (key) => currentBattleState[ key ]
    };
};
