import { BattleScene } from '../scenes/BattleScene';
import { Sort, SortInfos } from './Sort';
import { Player } from './Player';
import { Team } from './Team';

export type CharacterType =
    | 'sampleChar1'
    | 'sampleChar2'
    | 'sampleChar3';

export interface Position extends Required<Phaser.Types.Math.Vector2Like> {
}

export interface CharacterInfos {
    id: number;
    isMine: boolean;
    name: string;
    type: CharacterType;
    position: Position;
    life: number;
    actionTime: number;
    sortsInfos: SortInfos[];
}

export class Character {

    readonly id: number;
    readonly isMine: boolean;
    readonly type: CharacterType;
    readonly name: string;

    position: Position;
    life: number;
    actionTime: number;

    readonly sorts: Sort[];

    readonly graphicContainer: Phaser.GameObjects.Container;

    readonly player: Player;
    readonly team: Team;

    constructor({
        id, isMine, name, type, position, life, actionTime, sortsInfos
    }: CharacterInfos, player: Player, team: Team, scene: BattleScene) {
        this.id = id;
        this.isMine = isMine;
        this.name = name;
        this.type = type;

        this.position = position;
        this.life = life;
        this.actionTime = actionTime;

        this.player = player;
        this.team = team;

        this.sorts = sortsInfos.map(infos => new Sort(infos, this));

        const worldPosition = scene.map.tileToWorldPosition(position, true);

        this.graphicContainer = scene.add.container(worldPosition.x + 0.5, worldPosition.y + 0.5);

        const { tileWidth, tileHeight } = scene.map.tilemap;
        const graphicSquare = new Phaser.GameObjects.Rectangle(scene, 0, 0, tileWidth, tileHeight);
        graphicSquare.setStrokeStyle(1, team.color);

        const graphicSprite = new Phaser.GameObjects.Sprite(scene, 0, 0, type);

        const graphicText = new Phaser.GameObjects.Text(scene, 0, 0, name, {
            color: 'black'
        });
        graphicText.setOrigin(0.5, 1);

        this.graphicContainer.add([
            graphicSquare,
            graphicSprite,
            graphicText
        ]);
    }
}