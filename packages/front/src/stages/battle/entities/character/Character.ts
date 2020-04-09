import { assertIsDefined, assertThenGet, CharacterFeatures, CharacterSnapshot, equals, mergeAfterClean, Orientation, Position, SpellType, StaticCharacter } from '@timeflies/shared';
import { assertEntitySnapshotConsistency } from '../../snapshot/SnapshotManager';
import { Player } from '../player/Player';
import { Spell } from '../spell/Spell';
import { PeriodicEntity } from '../PeriodicEntity';
import { BattleDataPeriod } from '../../../../BattleData';

export interface Character<P extends BattleDataPeriod> extends PeriodicEntity<P, CharacterSnapshot> {
    readonly id: string;
    readonly staticData: Readonly<StaticCharacter>;
    readonly isMine: boolean;
    readonly position: Readonly<Position>;
    readonly orientation: Orientation;
    readonly features: Readonly<CharacterFeatures>;

    readonly spells: readonly Spell<P>[];
    readonly defaultSpell: Spell<P>;

    readonly isAlive: boolean;

    readonly player: Player<P>;

    set(o: { [ K in keyof Pick<Character<P>, 'position' | 'orientation'> ]?: Character<P>[ K ] }): void;

    hasSpell(spellType: SpellType): boolean;
}

// TODO add test to ensure that given objects are copied
// TODO add period attribute to all entities
export const Character = <P extends BattleDataPeriod>(period: P, {
    staticData, orientation: _orientation, position: _position, features: _features, spellsSnapshots: _spellsSnapshots
}: CharacterSnapshot, player: Player<P>): Character<P> => {

    let position: Position = { ..._position };
    let orientation: Orientation = _orientation;
    const features: Readonly<CharacterFeatures> = { ..._features };

    const _this: Character<P> = {
        period,
        get id(): string {
            return staticData.id;
        },
        staticData,
        get isMine(): boolean {
            return player.itsMe;
        },
        get position(): Readonly<Position> {
            return position;
        },
        get orientation(): Orientation {
            return orientation;
        },
        get features(): Readonly<CharacterFeatures> {
            return features;
        },
        get spells(): readonly Spell<P>[] {
            return spells;
        },
        get defaultSpell(): Spell<P> {
            return defaultSpell;
        },
        get isAlive(): boolean {
            return features.life > 0;
        },
        player,

        getSnapshot() {
            return {
                id: staticData.id,
                staticData,
                features,
                position,
                orientation,
                spellsSnapshots: spells.map(s => s.getSnapshot())
            };
        },

        updateFromSnapshot(snapshot: CharacterSnapshot) {
            position = { ...snapshot.position };
            orientation = snapshot.orientation;

            mergeAfterClean(features, snapshot.features);

            assertEntitySnapshotConsistency(spells, snapshot.spellsSnapshots);

            snapshot.spellsSnapshots.forEach(sSnap => {
                spells.find(s => s.id === sSnap.id)!.updateFromSnapshot(sSnap);
            });
        },

        set(o) {
            if (equals(o)(_this)) {
                return;
            }

            if (o.position) {
                position = { ...o.position };
            }
            if (o.orientation) {
                orientation = o.orientation;
            }
        },

        hasSpell(spellType) {
            return spells.some(s => s.staticData.type === spellType);
        }
    };

    const spells = _spellsSnapshots.map(snap => Spell(period, snap, _this));
    const defaultSpell = assertThenGet(spells.find(s => s.id === staticData.defaultSpellId), assertIsDefined);

    return _this;
};

// export class Character2 implements WithSnapshot<CharacterSnapshot> {

//     static readonly getSheetKey = (
//         type: CharacterType
//     ): string => `${type}_sheet`;

//     static readonly getAnimKey = (
//         type: CharacterType,
//         state: CharacterState,
//         orientation: Orientation
//     ): string => `${type}_${state}_${orientation}`;

//     private readonly scene: BattleScene;

//     readonly staticData: Readonly<StaticCharacter>;
//     get id(): string {
//         return this.staticData.id;
//     }
//     get isMine(): boolean {
//         return this.player.itsMe;
//     }

//     private _position: Position;
//     public get position(): Position {
//         return this._position;
//     }

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

//     readonly characterGraphic: CharacterGraphic;

//     constructor({
//         staticData, orientation, position, features, spellsSnapshots
//     }: CharacterSnapshot, player: Player, team: Team, scene: BattleScene) {
//         this.scene = scene;
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

//         this.characterGraphic = new CharacterGraphic(scene, this);
//     }

//     init(): this {
//         this.characterGraphic.init();

//         this.characterGraphic.updateAnimation();

//         return this;
//     }

//     initHUD(): void {
//         this.characterGraphic.initHUD();
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

//     getSnapshot(): CharacterSnapshot {
//         return {
//             staticData: this.staticData,
//             features: { ...this.features },
//             orientation: this.orientation,
//             position: this.position,
//             spellsSnapshots: this.spells.map(s => s.getSnapshot())
//         };
//     }

//     updateFromSnapshot(snapshot: CharacterSnapshot): void {
//         this.setPosition(snapshot.position, true);
//         this.setOrientation(snapshot.orientation, false);
//         this.setCharacterState('idle');
//         Object.keys(this.features).forEach(k => delete this.features[k]);
//         Object.assign(this.features, snapshot.features);
//         snapshot.spellsSnapshots.forEach(sSnap => {
//             const spell = this.spells.find(s => s.id === sSnap.staticData.id);

//             spell!.updateFromSnapshot(sSnap);
//         });
//     }

//     getGraphics(): Phaser.GameObjects.Container[] {
//         return [
//             this.characterGraphic.containerSprite,
//             this.characterGraphic.containerHUD
//         ];
//     }
// }