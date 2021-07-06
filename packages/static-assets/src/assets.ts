
export module Assets {
    export const spritesheets = {
        entities: '/static/spritesheets/spritesheet-entities.json'
    };

    export type SpritesheetKey = keyof typeof spritesheets;

    const getMusicPathList = (musicFolderName: string) => [ 'ogg', 'wav', 'mp3' ]
        .map(ext => `/static/audio/musics/${musicFolderName}/${musicFolderName}.${ext}`);

    export const musics = {
        menu: [
            getMusicPathList('Ludum Dare 30 - Track 7'),
            getMusicPathList('Ludum Dare 28 - Track 3'),
        ],
        battle: [
            getMusicPathList('Ludum Dare 30 - Track 2'),
            getMusicPathList('Ludum Dare 30 - Track 9'),
        ]
    };

    export type MusicKey = keyof typeof musics;
}
