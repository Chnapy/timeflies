
export module Assets {
    export const spritesheets = {
        entities: '/static/spritesheets/spritesheet-entities.json'
    };

    export type SpritesheetKey = keyof typeof spritesheets;
}
