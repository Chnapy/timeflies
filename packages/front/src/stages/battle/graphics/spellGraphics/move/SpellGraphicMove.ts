import { Position } from '@timeflies/shared';

export const SpellGraphicMove = (
    pathWorld: Position[]
) => {

    return {
        update(graphics: Phaser.GameObjects.Graphics) {

            graphics.beginPath();

            graphics.lineStyle(2, 0xff0000, 1);

            pathWorld.forEach((p, i) => {
                if (!i) {
                    graphics.moveTo(p.x, p.y);
                } else {
                    graphics.lineTo(p.x, p.y);
                }
            });

            graphics.strokePath();
        }
    };
};
