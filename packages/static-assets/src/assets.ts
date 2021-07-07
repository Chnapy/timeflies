import { ArrayUtils } from '@timeflies/common';

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

    const getSoundPathList = (soundFolderName: string, filesNames: string[]) => filesNames
        .map(fileName => [ `/static/audio/sounds/${soundFolderName}/${fileName}.ogg` ]);

    export const sounds = {
        battleLose: getSoundPathList('battle-lose', [ 'negative' ]),
        battleWin: getSoundPathList('battle-win', [ 'sharp_echo' ]),
        buttonClick: getSoundPathList('button-click', [ 'click3' ]),
        characterAttackSword: getSoundPathList('character-attack-sword', [ 'swing', 'swing2', 'swing3' ]),
        characterHit: getSoundPathList('character-hit', [ 'HIT_SHORT_04', 'HIT_SLAP_07' ]),
        characterWalkNormal: getSoundPathList('character-walk-normal', ArrayUtils.range(10).map(i => `footstep0${i}`)),
        characterWalkSlime: getSoundPathList('character-walk-slime', ArrayUtils.range(10).map(i => `slime${i + 1}`)),
        error: getSoundPathList('error', [ 'error_001' ]),
        roomReady: getSoundPathList('room-ready', [ 'switch_003' ]),
        spellLaunch: getSoundPathList('spell-launch', [ 'tick_002' ]),
        spellLaunchDenied: getSoundPathList('spell-launch-denied', [ 'back_002' ]),
        spellLaunchInterrupt: getSoundPathList('spell-launch-interrupt', [ 'back_004' ]),
        turnEnd: getSoundPathList('turn-end', [ 'MENU B_Back' ]),
        turnStart: getSoundPathList('turn-start', [ 'MENU B_Select' ]),
    };

    export type SoundKey = keyof typeof sounds;
}
