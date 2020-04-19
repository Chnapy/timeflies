import { assertIsDefined, BattleSnapshot, equals, getBattleSnapshotWithHash as _getBattleSnapshotWithHash, getOrientationFromTo, SpellActionSnapshot, OmitFn } from '@timeflies/shared';
import { Character } from '../entities/character/Character';
import { Player } from '../entities/player/Player';
import { Spell } from '../entities/spell/Spell';
import { Team } from '../entities/team/Team';

interface InnerBattleState {
    battleHashList: string[];
    teams: Team[];
    players: Player[];
    characters: Character[];
    spells: Spell[];
    clone(): InnerBattleState;
}

export type BattleState = Readonly<{
    [ key in keyof OmitFn<InnerBattleState> ]: InnerBattleState[ key ] extends (infer T)[]
    ? readonly Readonly<T>[]
    : Readonly<InnerBattleState[ key ]>;
}>;

export interface BattleStateManager {
    battleState: BattleState;
    generateFirstSnapshot(launchTime: number): BattleSnapshot;
    useSpellAction(spellAction: SpellActionSnapshot): {
        onClone(): {
            ifCorrectHash(fn: (hash: string, applyOnCurrentState: () => { deaths: Character[] }) => void): boolean;
        };
    };
}

interface Dependencies {
    getBattleSnapshotWithHash: typeof _getBattleSnapshotWithHash;
}

export const BattleStateManager = (
    _teams: Team[],
    { getBattleSnapshotWithHash }: Dependencies = { getBattleSnapshotWithHash: _getBattleSnapshotWithHash }
): BattleStateManager => {

    const generateBattleState = (teams: Team[]): InnerBattleState => {
        const players = teams.flatMap(t => t.players);
        const characters = players.flatMap(p => p.characters);
        const spells = characters.flatMap(c => c.spells);

        const clone = () => generateBattleState(teams.map(t => t.clone()));

        return {
            battleHashList: [],
            teams,
            players,
            characters,
            spells,
            clone
        };
    };

    const generateSnapshot = ({ teams, battleHashList }: InnerBattleState, launchTime: number, time: number): BattleSnapshot => {

        const snap = getBattleSnapshotWithHash({
            time,
            launchTime,
            teamsSnapshots: teams.map(team => team.toSnapshot())
        });

        battleHashList.push(snap.battleHash);

        return snap;
    };

    // TODO share all these functions
    const applyMoveAction = (spell: Spell, { position }: SpellActionSnapshot, battleState: InnerBattleState): Character[] => {
        const { character } = spell;

        const orientation = getOrientationFromTo(character.position, position);

        character.position = position;
        character.orientation = orientation;

        return [];
    };

    const applySimpleAttack = (spell: Spell, { actionArea }: SpellActionSnapshot, { characters }: InnerBattleState): Character[] => {

        const targets = characters.filter(c => c.isAlive && actionArea.some(p => equals(p)(c.position)));

        targets.forEach(t => t.alterLife(-50));

        return targets.filter(t => !t.isAlive);
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

    const applySpellAction = (spellAction: SpellActionSnapshot, battleState: InnerBattleState): Character[] => {

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
                const cloneBattleState = currentBattleState.clone();

                applySpellAction(spellAction, cloneBattleState);

                const snapshotClone = generateSnapshot(cloneBattleState, -1, -1);

                return {
                    ifCorrectHash: (fn: (hash: string, applyOnCurrentState: () => { deaths: Character[] }) => void) => {
                        if (snapshotClone.battleHash === spellAction.battleHash) {

                            fn(snapshotClone.battleHash, () => {
                                currentBattleState.battleHashList.push(snapshotClone.battleHash);
                                const deaths = applySpellAction(spellAction, currentBattleState);
                                return { deaths };
                            });
                            return true;
                        }
                        return false;
                    }
                };
            }
        };
    };

    const generateFirstSnapshot = (launchTime: number) => {
        return generateSnapshot(currentBattleState, launchTime, launchTime);
    };

    const currentBattleState = generateBattleState(_teams);

    return {
        battleState: currentBattleState,
        generateFirstSnapshot,
        useSpellAction
    };
};
