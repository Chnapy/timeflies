import { BattleScene } from '../scenes/BattleScene';
import { Player } from './Player';
import { Spell, SpellSnapshot } from './Spell';
import { Team } from "./Team";
import { WithSnapshot } from './WithSnapshot';
import { CharacterGraphic } from './CharacterGraphic';

export type CharacterType =
    | 'sampleChar1'
    | 'sampleChar2'
    | 'sampleChar3';

export interface Position extends Required<Phaser.Types.Math.Vector2Like> {
}

export type CharacterState = 'idle' | 'move';

export type Orientation = 'left' | 'right' | 'top' | 'bottom';

export interface CharacterFeatures {
    life: number;
    actionTime: number;
}

export interface CharacterSnapshot {
    id: number;
    isMine: boolean;
    name: string;
    type: CharacterType;
    position: Position;
    orientation: Orientation;
    features: CharacterFeatures;
    initialFeatures: CharacterFeatures;
    spellsSnapshots: SpellSnapshot[];
    defaultSpellId: number;
}

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

    readonly id: number;
    readonly isMine: boolean;
    readonly type: CharacterType;
    readonly name: string;

    private _position: Position;
    public get position(): Position {
        return this._position;
    }

    private _orientation: Orientation;
    public get orientation(): Orientation {
        return this._orientation;
    }

    readonly initialFeatures: Readonly<CharacterFeatures>;
    features: CharacterFeatures;

    readonly spells: Spell[];
    readonly defaultSpell: Spell;

    state: CharacterState;

    readonly player: Player;
    readonly team: Team;

    private readonly characterGraphic: CharacterGraphic;

    constructor({
        id, isMine, name, type, position, orientation, initialFeatures, features, defaultSpellId, spellsSnapshots
    }: CharacterSnapshot, player: Player, team: Team, scene: BattleScene) {
        this.scene = scene;
        this.id = id;
        this.isMine = isMine;
        this.name = name;
        this.type = type;

        this.state = 'idle';
        this._orientation = orientation;
        this._position = position;
        this.initialFeatures = initialFeatures;
        this.features = features;

        this.player = player;
        this.team = team;

        this.spells = spellsSnapshots.map(snap => new Spell(snap, this, scene));
        this.defaultSpell = this.spells.find(s => s.id === defaultSpellId)!;

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
        if(spell.attaque) {
            this.features.life -= spell.attaque;
            this.characterGraphic.updateLife();
        }
        this.characterGraphic.receiveSpell(spell);
    }
    
    removeSpell(): void {
        this.characterGraphic.removeSpell();
    }

    canMove(): boolean {
        return this.spells.some(s => s.type === 'move');
    }

    canOrientate(): boolean {
        return this.spells.some(s => s.type === 'orientate');
    }

    getSnapshot(): CharacterSnapshot {
        return {
            id: this.id,
            isMine: this.isMine,
            name: this.name,
            type: this.type,
            position: this.position,
            orientation: this.orientation,
            initialFeatures: this.initialFeatures,
            features: this.features,
            spellsSnapshots: this.spells.map(s => s.getSnapshot()),
            defaultSpellId: this.defaultSpell.id
        };
    }

    updateFromSnapshot(snapshot: CharacterSnapshot): void {
        this.setPosition(snapshot.position, true);
        this.setOrientation(snapshot.orientation, false);
        this.setCharacterState('idle');
        this.features = snapshot.features;
        snapshot.spellsSnapshots.forEach(sSnap => {
            const spell = this.spells.find(s => s.id === sSnap.id);

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