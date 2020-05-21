import { CharacterType, Orientation } from "@timeflies/shared";
import { RectStyled } from "../../../hud/generics/RectStyled";

export class CharacterGraphic {

    static readonly getSheetKey = (
        type: CharacterType
    ): string => `${type}_sheet`;

    static readonly getAnimKey = (
        type: CharacterType,
        state: any,
        orientation: Orientation
    ): string => `${type}_${state}_${orientation}`;

    private readonly scene: any;
    private readonly character: any;

    containerSprite!: any;
    private sprite!: any;

    containerHUD!: any;
    private lifeBarBorder!: RectStyled<never>;
    private lifeBar!: RectStyled<RectStyled<never>>;
    private lifeBarFront!: RectStyled<never>;
    private teamRect!: RectStyled<never>;

    private caContainer!: RectStyled<never>;
    private caText!: any;
    private caIcon!: any;

    constructor(scene: any, character: any) {
        this.scene = scene;
        this.character = character;
    }

    init(): void {
        this.containerSprite = this.scene.add.container(0, 0);

        const { tileWidth, tileHeight } = this.scene.map.tilemap;

        this.sprite = this.scene.add.sprite(tileWidth / 2, tileHeight / 2, CharacterGraphic.getSheetKey(this.character.staticData.type));

        this.containerSprite.add([
            this.sprite
        ]);
    }

    initHUD() {
        this.containerHUD = this.scene.add.container(0, 0);

        const { tileWidth } = this.scene.map.tilemap;

        const hudHeight = 10;
        const top = -7;
        const margin = 2;

        const teamRectSize = hudHeight;
        const lifeBarSize = {
            width: tileWidth - teamRectSize - margin,
            height: hudHeight
        };

        const P: any = null as any;
        const lifeBarFill = P.Display.Color.HexStringToColor(window
            .getComputedStyle(document.documentElement)
            .getPropertyValue('--bg-color-3')
            .substring(1));

        const lifeBarFrontFill = P.Display.Color.HexStringToColor(window
            .getComputedStyle(document.documentElement)
            .getPropertyValue('--life-color')
            .substring(1));

        this.teamRect = new RectStyled(this.scene);

        this.lifeBarBorder = new RectStyled(this.scene);
        this.lifeBar = new RectStyled(this.scene);
        this.lifeBarFront = new RectStyled(this.scene);

        this.caContainer = new RectStyled(this.scene);

        const { color: teamColor } = P.Display.Color.HexStringToColor(this.character.player.team.color);

        this.teamRect.setStyle({
            originX: 0,
            originY: 1,
            x: 0,
            y: top,
            width: teamRectSize,
            height: teamRectSize,
            fillColor: teamColor
        });

        this.lifeBarBorder.setStyle({
            originX: 1,
            originY: 1,
            x: tileWidth,
            y: top,
            ...lifeBarSize,
            fillColor: 0xFFFFFF
        });

        this.lifeBar.setStyle({
            originX: 1,
            originY: 1,
            x: tileWidth - 1,
            y: top - 1,
            width: lifeBarSize.width - 2,
            height: lifeBarSize.height - 2,
            fillColor: lifeBarFill.color,
            fillAlpha: 0.8
        });

        this.lifeBarFront.setStyle({
            originX: 1,
            originY: 1,
            y: top - 1,
            height: lifeBarSize.height - 2,
            fillColor: lifeBarFrontFill.color
        });

        this.caIcon = this.scene.add.image(1, -hudHeight + 1, 'SpellGraphic.getSheetKey()')
            .setOrigin(0, 0)
            .setDisplaySize(hudHeight - 2, hudHeight - 2);


        this.caText = this.scene.add.text(hudHeight, -hudHeight, '', {
            fontSize: 10
        })
            .setOrigin(0, 0);

        this.caContainer.getRootGameObject().add([this.caIcon, this.caText]);

        this.caContainer.setStyle({
            originX: 0,
            originY: 1,
            x: tileWidth + margin,
            y: top,
            width: 30,
            height: hudHeight,
            fillColor: 0x333333,
            visible: false
        });

        this.containerHUD.add([
            this.teamRect.getRootGameObject(),
            this.lifeBarBorder.getRootGameObject(),
            this.lifeBar.getRootGameObject(),
            this.lifeBarFront.getRootGameObject(),
            this.caContainer.getRootGameObject()
        ]);

        this.updatePosition();
        this.updateLife();
    }

    receiveSpell(spell: any): void {
        const { staticData: { type }, feature: { attack } } = spell;
        this.caText.setText(attack ? `-${attack}` : '');
        // this.caIcon.setFrame(AssetManager.spells.spellsMap[type])
        this.caContainer.setStyle({ visible: true });
    }

    removeSpell(): void {
        this.caContainer.setStyle({ visible: false });
    }

    updatePosition(): void {
        const worldPosition = this.scene.map.tileToWorldPosition(this.character.position);
        this.containerSprite.setPosition(worldPosition.x, worldPosition.y);
        this.containerHUD.setPosition(worldPosition.x, worldPosition.y);
    }

    updateLife(): void {
        const maxLife = this.character.staticData.initialFeatures.life;
        const presentLife = this.character.features.life;

        const ratio = presentLife / maxLife;

        const { width: maxWidth, x: maxX } = this.lifeBar.style;
        const width = maxWidth * ratio;
        const x = maxX - (maxWidth - width);

        this.lifeBarFront.setStyle({
            x,
            width
        });
    }

    updateAnimation(): void {
        const { staticData: { type }, orientation } = this.character;

        this.sprite.anims.play(
            CharacterGraphic.getAnimKey(type, null as any, orientation),
            true
        );
    }
}