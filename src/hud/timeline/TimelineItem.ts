import { Character } from '../../phaser/entities/Character';
import { ReducerManager } from '../../ReducerManager';
import { HUDScene } from '../HUDScene';
import { BattleTurnStartAction, BattleTurnEndAction } from '../../phaser/battleReducers/BattleReducerManager';
import { HasGameObject } from '../layout/HasGameObject';
import { TimelineItemContent } from './TimelineItemContent';
let a: any;
export class TimelineItem extends ReducerManager<HUDScene> implements HasGameObject {

    static readonly HEIGHT = 70;

    readonly character: Character;

    readonly container: Phaser.GameObjects.Container;

    private readonly faceImage: Phaser.GameObjects.Image;
    private readonly nameText: Phaser.GameObjects.Text;

    private itemContent?: TimelineItemContent;
    
    constructor(scene: HUDScene, character: Character) {
        super(scene);
        this.character = character;

        this.faceImage = scene.add.image(0, 0, Character.getSheetKey(character.type), 'player_23.png')
            .setOrigin(0, 0.5);

        this.nameText = scene.add.text(0, 0, `${character.name} ${character.features.life}`);
        
        this.container = new Phaser.GameObjects.Container(scene, undefined, undefined, [
            this.faceImage,
            this.nameText,
        ])
        .setAlpha(character.isMine ? 1 : 0.5);
    }

    update(time: number, delta: number): void {
        this.nameText.setText(`${this.character.name} ${this.character.features.life}`);
        this.itemContent?.update();
    }

    getRootGameObject(): Phaser.GameObjects.GameObject {
        return this.container;
    }

    resize(x: number, y: number, width: number, height: number): void {
        a = {x,y,width,height};
        this.container.setPosition(x, y);
        this.faceImage.setPosition(0, height / 2);
        this.nameText.setPosition(this.faceImage.width + 10, this.faceImage.y);
        this.itemContent?.resize(width / 2, 0, width / 2, height);
    }

    private onTurnStart = this.reduce<BattleTurnStartAction>('battle/turn/start', ({
        character
    }) => {
        if(character.id === this.character.id) {
            this.itemContent = new TimelineItemContent(this.scene, this.character);
            this.container.add(this.itemContent.getRootGameObject());
            this.resize(a.x, a.y, a.width, a.height);
        }
    });

    private onTurnEnd = this.reduce<BattleTurnEndAction>('battle/turn/end', ({
        character
    }) => {
        if(character.id === this.character.id) {
            this.container.remove(this.itemContent!.getRootGameObject(), true);
            delete this.itemContent;
        }
    });
}
