import { CharacterFeatures, CharacterSnapshot, Orientation, Position, StaticCharacter } from '@timeflies/shared';
import { BattleDataPeriod } from '../../snapshot/battle-data';

export type Character<P extends BattleDataPeriod> = {
    id: string;
    period: P;
    isMine: boolean;
    staticData: Readonly<StaticCharacter>;
    position: Readonly<Position>;
    orientation: Orientation;
    features: CharacterFeatures;

    defaultSpellId: string;

    playerId: string;
};

export const characterToSnapshot = ({ id, playerId, staticData, position, orientation, features }: Character<BattleDataPeriod>): CharacterSnapshot => {
    return {
        id,
        playerId,
        staticData,
        position,
        orientation,
        features,
    };
};

export const characterAlterLife = ({ features }: Character<BattleDataPeriod>, value: number) => {
    features.life = Math.max(features.life + value, 0);
};

export const characterIsAlive = (character: Character<BattleDataPeriod>) => character.features.life > 0;

export const Character = <P extends BattleDataPeriod>(period: P, myPlayerId: string, {
    id, staticData, orientation, position, features, playerId
}: CharacterSnapshot): Character<P> => {

    return {
        id,
        period,
        isMine: playerId === myPlayerId,
        staticData,
        position,
        orientation,
        features,
        defaultSpellId: staticData.defaultSpellId,
        playerId
    };

    // const _this: Character<P> = {
    //     period,
    //     get id(): string {
    //         return staticData.id;
    //     },
    //     staticData,
    //     get isMine(): boolean {
    //         return player.itsMe;
    //     },
    //     get position(): Readonly<Position> {
    //         return position;
    //     },
    //     get orientation(): Orientation {
    //         return orientation;
    //     },
    //     get features(): Readonly<CharacterFeatures> {
    //         return features;
    //     },
    //     get spells(): readonly Spell<P>[] {
    //         return spells;
    //     },
    //     get defaultSpell(): Spell<P> {
    //         return defaultSpell;
    //     },
    //     get isAlive(): boolean {
    //         return features.life > 0;
    //     },
    //     player,

    //     getSnapshot() {
    //         return {
    //             id: staticData.id,
    //             staticData,
    //             features: { ...features },
    //             position,
    //             orientation,
    //             spellsSnapshots: spells.map(s => s.getSnapshot())
    //         };
    //     },

    //     updateFromSnapshot(snapshot: CharacterSnapshot) {
    //         position = { ...snapshot.position };
    //         orientation = snapshot.orientation;

    //         // TODO do something about object ref issues
    //         features = {
    //             ...snapshot.features
    //         };

    //         // assertEntitySnapshotConsistency(spells, snapshot.spellsSnapshots);

    //         snapshot.spellsSnapshots.forEach(sSnap => {
    //             spells.find(s => s.id === sSnap.id)!.updateFromSnapshot(sSnap);
    //         });
    //     },

    //     set(o) {
    //         if (equals(o)(_this)) {
    //             return;
    //         }

    //         if (o.position) {
    //             position = { ...o.position };
    //         }
    //         if (o.orientation) {
    //             orientation = o.orientation;
    //         }
    //     },

    //     alterLife(add: number): void {
    //         const life = Math.max(features.life + add, 0);
    //         features = { ...features, life };
    //     },

    //     hasSpell(spellType) {
    //         return spells.some(s => s.staticData.type === spellType);
    //     }
    // };

    // const spells = _spellsSnapshots.map(snap => Spell(period, snap, _this));
    // const defaultSpell = assertThenGet(spells.find(s => s.id === staticData.defaultSpellId), assertIsDefined);

    // return _this;
};

// export class Character2 implements WithSnapshot<CharacterSnapshot> {


//     private _orientation: Orientation;
//     public get orientation(): Orientation {
//         return this._orientation;
//     }

//     readonly features: CharacterFeatures;

//     readonly spells: Spell[];
//     readonly defaultSpell: Spell;

//     state: CharacterState;

//     readonly player: Player;
//     readonly team: Team;

//     constructor({
//         staticData, orientation, position, features, spellsSnapshots
//     }: CharacterSnapshot, player: Player, team: Team, scene: BattleScene) {
//         this.staticData = staticData;
//         this._orientation = orientation;
//         this._position = position;

//         this.state = 'idle';
//         this._orientation = orientation;
//         this._position = position;
//         this.features = { ...features };

//         this.player = player;
//         this.team = team;

//         this.spells = spellsSnapshots.map(snap => Spell(snap, this));
//         this.defaultSpell = this.spells.find(s => s.id === staticData.defaultSpellId)!;
//     }

//     setCharacterState(state: CharacterState): void {
//         if (this.state === state) {
//             return;
//         }
//         this.state = state;

//         this.characterGraphic.updateAnimation();
//     }

//     setCharacterOrientation(orientation: Orientation): void {
//         if (this.orientation === orientation) {
//             return;
//         }
//         this._orientation = orientation;

//         this.characterGraphic.updateAnimation();
//     }

//     setPosition(position: Position, updatePositionGraphic: boolean,
//         updateOrientation?: boolean, updateOrientationGraphic?: boolean): this {

//         if (this.position.x !== position.x || this.position.y !== position.y) {
//             if (updateOrientation) {
//                 this.setOrientation(this.getOrientationTo(position), !!updateOrientationGraphic);
//             }

//             this._position = position;
//         }

//         if (updatePositionGraphic) {
//             this.characterGraphic.updatePosition();
//         }

//         return this;
//     }

//     setOrientation(orientation: Orientation, updateOrientationGraphic: boolean): this {
//         if (this.orientation === orientation) {
//             return this;
//         }
//         this._orientation = orientation;

//         if (updateOrientationGraphic) {
//             this.characterGraphic.updateAnimation();
//         }

//         return this;
//     }

//     getOrientationTo(to: Position): Orientation {
//         const { position: from } = this;

//         const diffX = to.x - from.x;
//         const diffY = to.y - from.y;

//         if (Math.abs(diffX) > Math.abs(diffY)) {
//             return diffX > 0
//                 ? 'right'
//                 : 'left';
//         } else {
//             return diffY > 0
//                 ? 'bottom'
//                 : 'top';
//         }
//     }

//     receiveSpell(spell: Spell): void {
//         if (spell.feature.attack) {
//             this.features.life -= spell.feature.attack;
//             this.characterGraphic.updateLife();
//         }
//         this.characterGraphic.receiveSpell(spell);
//     }

//     removeSpell(): void {
//         this.characterGraphic.removeSpell();
//     }

//     canMove(): boolean {
//         return this.spells.some(s => s.staticData.type === 'move');
//     }

//     canOrientate(): boolean {
//         return this.spells.some(s => s.staticData.type === 'orientate');
//     }
