import { BattleScene } from '../scenes/BattleScene';
import { Player } from './Player';
import { Spell, SpellSnapshot } from './Spell';
import { Team } from "./Team";
import { WithSnapshot } from './WithSnapshot';

export type CharacterType =
    | 'sampleChar1'
    | 'sampleChar2'
    | 'sampleChar3';

export interface Position extends Required<Phaser.Types.Math.Vector2Like> {
}

export type CharacterState = 'idle' | 'move';

export type Orientation = 'left' | 'right' | 'top' | 'bottom';

export interface CharacterSnapshot {
    id: number;
    isMine: boolean;
    name: string;
    type: CharacterType;
    position: Position;
    orientation: Orientation;
    // state: CharacterState;
    life: number;
    actionTime: number;
    spellsSnapshots: SpellSnapshot[];
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

    life: number;
    actionTime: number;

    readonly spells: Spell[];

    state: CharacterState;
    graphicContainer!: Phaser.GameObjects.Container;

    readonly player: Player;
    readonly team: Team;

    private graphicSprite!: Phaser.GameObjects.Sprite;

    constructor({
        id, isMine, name, type, position, orientation, life, actionTime, spellsSnapshots
    }: CharacterSnapshot, player: Player, team: Team, scene: BattleScene) {
        this.scene = scene;
        this.id = id;
        this.isMine = isMine;
        this.name = name;
        this.type = type;

        this.state = 'idle';
        this._orientation = orientation;
        this._position = position;
        this.life = life;
        this.actionTime = actionTime;

        this.player = player;
        this.team = team;

        this.spells = spellsSnapshots.map(snap => new Spell(snap, this, scene));
    }

    init(): this {
        const worldPosition = this.scene.map.tileToWorldPosition(this.position, true);

        this.graphicContainer = this.scene.add.container(worldPosition.x + 0.5, worldPosition.y + 0.5);

        const { tileWidth, tileHeight } = this.scene.map.tilemap;
        const graphicSquare = new Phaser.GameObjects.Rectangle(this.scene, 0, 0, tileWidth, tileHeight);
        graphicSquare.setStrokeStyle(1, this.team.color);

        this.graphicSprite = this.scene.add.sprite(0, 0, Character.getSheetKey(this.type));

        this.graphicContainer.add([
            graphicSquare,
            this.graphicSprite
        ]);

        this.updateAnimation();

        return this;
    }

    setCharacterState(state: CharacterState): void {
        if (this.state === state) {
            return;
        }
        this.state = state;

        this.updateAnimation();
    }

    setCharacterOrientation(orientation: Orientation): void {
        if (this.orientation === orientation) {
            return;
        }
        this._orientation = orientation;

        this.updateAnimation();
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
            const worldPosition = this.scene.map.tileToWorldPosition(position, true);
            this.graphicContainer.setPosition(worldPosition.x, worldPosition.y);
        }

        return this;
    }

    setOrientation(orientation: Orientation, updateOrientationGraphic: boolean): this {
        if (this.orientation === orientation) {
            return this;
        }
        this._orientation = orientation;

        if (updateOrientationGraphic) {
            this.updateAnimation();
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
            life: this.life,
            actionTime: this.actionTime,
            spellsSnapshots: this.spells.map(s => s.getSnapshot())
        };
    }

    updateFromSnapshot(snapshot: CharacterSnapshot): void {
        this.setPosition(snapshot.position, true);
        this.setOrientation(snapshot.orientation, false);
        this.setCharacterState('idle');
        this.life = snapshot.life;
        this.actionTime = snapshot.actionTime;
        snapshot.spellsSnapshots.forEach(sSnap => {
            const spell = this.spells.find(s => s.id === sSnap.id);

            spell!.updateFromSnapshot(sSnap);
        });
    }

    private updateAnimation(): void {
        this.graphicSprite.anims.play(
            Character.getAnimKey(this.type, this.state, this.orientation),
            true
        );
    }
}