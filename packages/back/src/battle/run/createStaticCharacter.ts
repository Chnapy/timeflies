import { CharacterRole, StaticCharacter } from '@timeflies/shared';


export const createStaticCharacter = (id: string, type: CharacterRole): StaticCharacter => {

    switch (type) {
        case 'vemo':
            return createVemo(id);
        case 'tacka':
            return createTacka(id);
        case 'meti':
            return createMeti(id);
    }
};

const createVemo = (id: string): StaticCharacter => {

    return {
        id,
        role: 'vemo',
        name: 'Vemo',
        description: 'A character focused in placement & map control',
        initialFeatures: {
            life: 80,
            actionTime: 20000
        },
        staticSpells: [
            {
                id: id + '-1',
                name: 'Switch',
                role: 'switch',
                description: 'Moves launcher in diagonal, switching position with others characters if any',
                initialFeatures: {
                    duration: 2000,
                    lineOfSight: true,
                    rangeArea: 2,
                    actionArea: 0,
                }
            },
            {
                id: id + '-2',
                name: 'Incitement',
                role: 'incitement',
                description: 'Moves target depending of its orientation',
                initialFeatures: {
                    duration: 3000,
                    lineOfSight: false,
                    rangeArea: 5,
                    actionArea: 0,
                }
            },
            {
                id: id + '-3',
                name: 'Treacherous blow',
                role: 'treacherousBlow',
                description: 'Attacks its target, removing life points. If target is from the back (from launcher point of view), then damages are considerably increased. Also change target orientation towards launcher.',
                initialFeatures: {
                    duration: 5000,
                    lineOfSight: false,
                    rangeArea: 1,
                    actionArea: 0,
                    attack: 20
                }
            },
            {
                id: id + '-4',
                name: 'Pressure',
                role: 'pressure',
                description: 'If target is an enemy, this spell removes life points from him. If target is an ally, this spell boosts him in action time. This spell does nothing if target orientation is not toward launcher.',
                initialFeatures: {
                    duration: 2000,
                    lineOfSight: true,
                    rangeArea: 2,
                    actionArea: 0,
                    attack: 10
                }
            }
        ],
        defaultSpellId: id + '-1'
    }
};

const createTacka = (id: string): StaticCharacter => {

    return {
        id,
        role: 'tacka',
        name: 'Tacka',
        description: 'A character focused in attack & heal.',
        initialFeatures: {
            life: 120,
            actionTime: 24000
        },
        staticSpells: [
            {
                id: id + '-1',
                name: 'Move',
                role: 'move',
                description: 'Moves the character one tile.',
                initialFeatures: {
                    lineOfSight: true,
                    rangeArea: -1,
                    actionArea: 1,
                    duration: 1000
                }
            },
            {
                id: id + '-2',
                name: 'Health sharing',
                role: 'healthSharing',
                description: 'Attacks enemies in an area, and heals allies in this same area. Enemies damages are shared to allies as heal.',
                initialFeatures: {
                    duration: 4000,
                    lineOfSight: true,
                    rangeArea: 3,
                    actionArea: 2,
                    attack: 20
                }
            },
            {
                id: id + '-3',
                name: 'Sacrificial gift',
                role: 'sacrificialGift',
                description: 'Attacks target and boosts close enemies. Enemies close to 3 tiles from target position are healed depending of damage, and there action time is boosted depending of spell duration.',
                initialFeatures: {
                    duration: 6000,
                    lineOfSight: true,
                    rangeArea: 1,
                    actionArea: 2,
                    attack: 60
                }
            },
            {
                id: id + '-4',
                name: 'Attention attraction',
                role: 'attentionAttraction',
                description: 'Heals allies and enemies, and changes there orientation.',
                initialFeatures: {
                    duration: 3000,
                    lineOfSight: true,
                    rangeArea: 6,
                    actionArea: 1,
                    attack: -20
                }
            },
        ],
        defaultSpellId: id + '-1'
    }
};

const createMeti = (id: string): StaticCharacter => {

    return {
        id,
        role: 'meti',
        name: 'Meti',
        description: 'A character focused in time management.',
        initialFeatures: {
            life: 90,
            actionTime: 20000
        },
        staticSpells: [
            {
                id: id + '-1',
                name: 'Move',
                role: 'move',
                description: 'Moves the character one tile.',
                initialFeatures: {
                    lineOfSight: true,
                    rangeArea: -1,
                    actionArea: 1,
                    duration: 1000
                }
            },
            {
                id: id + '-2',
                name: 'Slump',
                role: 'slump',
                description: 'Attacks target and removes action time from him.',
                initialFeatures: {
                    duration: 3000,
                    lineOfSight: true,
                    rangeArea: 4,
                    actionArea: 0,
                    attack: 15
                }
            },
            {
                id: id + '-3',
                name: 'Last resort',
                role: 'lastResort',
                description: 'Attacks target with damage depending of current remaining time. The less launcher action time left, the more powerful spell is.',
                initialFeatures: {
                    duration: 5000,
                    lineOfSight: true,
                    rangeArea: 2,
                    actionArea: 0,
                    attack: 20
                }
            },
            {
                id: id + '-4',
                name: 'Motivation',
                role: 'motivation',
                description: 'Boosts others characters action time, in exchange of launcher life. Life spent is shared as action time to others characters.',
                initialFeatures: {
                    duration: 3000,
                    lineOfSight: true,
                    rangeArea: 4,
                    actionArea: 1
                }
            },
        ],
        defaultSpellId: id + '-1'
    }
};
