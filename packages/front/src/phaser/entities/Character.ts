import { BattleScene } from '../scenes/BattleScene';
import { CharacterGraphic } from './CharacterGraphic';
import { Player } from './Player';
import { Spell } from './Spell';
import { Team } from "./Team";
import { WithSnapshot } from './WithSnapshot';
import { CharacterSnapshot, CharacterType, Orientation, CharacterFeatures, StaticCharacter, Position } from '@timeflies/shared'

export type CharacterState = 'idle' | 'move';

export class Character implements WithSnapshot<CharacterSnapshot> {

    static readonly getSheetKey = (
        type: CharacterType
    ): string => `${type}_sheet`;

    static readonly getAnimKey = (
        type: CharacterType,
        state: CharacterState,
        orientation: Orientation
    ): string => `${type}_${state}_${orientation}`;

    private readonly scene: BattleScene;

    readonly staticData: Readonly<StaticCharacter>;
    get id(): string {
        return this.staticData.id;
    }
    get isMine(): boolean {
        return this.player.itsMe;
    }

    private _position: Position;
    public get position(): Position {
        return this._position;
    }

    private _orientation: Orientation;
    public get orientation(): Orientation {
        return this._orientation;
    }

    readonly features: CharacterFeatures;

    readonly spells: Spell[];
    readonly defaultSpell: Spell;

    state: CharacterState;

    readonly player: Player;
    readonly team: Team;

    readonly characterGraphic: CharacterGraphic;

    constructor({
        staticData, orientation, position, features, spellsSnapshots
    }: CharacterSnapshot, player: Player, team: Team, scene: BattleScene) {
        this.scene = scene;
        this.staticData = staticData;
        this._orientation = orientation;
        this._position = position;

        this.state = 'idle';
        this._orientation = orientation;
        this._position = position;
        this.features = { ...features };

        this.player = player;
        this.team = team;

        this.spells = spellsSnapshots.map(snap => new Spell(snap, this, scene));
        this.defaultSpell = this.spells.find(s => s.id === staticData.defaultSpellId)!;

        this.characterGraphic = new CharacterGraphic(scene, this);
    }

    init(): this {
        this.characterGraphic.init();

        this.characterGraphic.updateAnimation();

        return this;
    }

    initHUD(): void {
        this.characterGraphic.initHUD();
    }

    setCharacterState(state: CharacterState): void {
        if (this.state === state) {
            return;
        }
        this.state = state;

        this.characterGraphic.updateAnimation();
    }

    setCharacterOrientation(orientation: Orientation): void {
        if (this.orientation === orientation) {
            return;
        }
        this._orientation = orientation;

        this.characterGraphic.updateAnimation();
    }

    setPosition(position: Position, updatePositionGraphic: boolean,
        updateOrientation?: boolean, updateOrientationGraphic?: boolean): this {

        if (this.position.x !== position.x || this.position.y !== position.y) {
            if (updateOrientation) {
                this.setOrientation(this.getOrientationTo(position), !!updateOrientationGraphic);
            }

            this._position = position;
        }

        if (updatePositionGraphic) {
            this.characterGraphic.updatePosition();
        }

        return this;
    }

    setOrientation(orientation: Orientation, updateOrientationGraphic: boolean): this {
        if (this.orientation === orientation) {
            return this;
        }
        this._orientation = orientation;

        if (updateOrientationGraphic) {
            this.characterGraphic.updateAnimation();
        }

        return this;
    }

    getOrientationTo(to: Position): Orientation {
        const { position: from } = this;

        const diffX = to.x - from.x;
        const diffY = to.y - from.y;

        if (Math.abs(diffX) > Math.abs(diffY)) {
            return diffX > 0
                ? 'right'
                : 'left';
        } else {
            return diffY > 0
                ? 'bottom'
                : 'top';
        }
    }

    receiveSpell(spell: Spell): void {
        if (spell.feature.attack) {
            this.features.life -= spell.feature.attack;
            this.characterGraphic.updateLife();
        }
        this.characterGraphic.receiveSpell(spell);
    }

    removeSpell(): void {
        this.characterGraphic.removeSpell();
    }

    canMove(): boolean {
        return this.spells.some(s => s.staticData.type === 'move');
    }

    canOrientate(): boolean {
        return this.spells.some(s => s.staticData.type === 'orientate');
    }

    getSnapshot(): CharacterSnapshot {
        return {
            staticData: this.staticData,
            features: { ...this.features },
            orientation: this.orientation,
            position: this.position,
            spellsSnapshots: this.spells.map(s => s.getSnapshot())
        };
    }

    updateFromSnapshot(snapshot: CharacterSnapshot): void {
        this.setPosition(snapshot.position, true);
        this.setOrientation(snapshot.orientation, false);
        this.setCharacterState('idle');
        Object.keys(this.features).forEach(k => delete this.features[k]);
        Object.assign(this.features, snapshot.features);
        snapshot.spellsSnapshots.forEach(sSnap => {
            const spell = this.spells.find(s => s.id === sSnap.staticData.id);

            spell!.updateFromSnapshot(sSnap);
        });
    }

    getGraphics(): Phaser.GameObjects.Container[] {
        return [
            this.characterGraphic.containerSprite,
            this.characterGraphic.containerHUD
        ];
    }
}