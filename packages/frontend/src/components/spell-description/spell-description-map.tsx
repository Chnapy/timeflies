import { SpellRole, SpellVariableName, SpellVariables } from '@timeflies/common';

type VariableTextGetter<N extends SpellVariableName> = (cb?: (value: NonNullable<SpellVariables[ N ]>) => NonNullable<SpellVariables[ N ]>) => React.ReactNode;
export type VariableTextMap = {
    [ N in SpellVariableName ]: VariableTextGetter<N>;
};

export const spellDescriptionMap: {
    [ spellRole in SpellRole ]: {
        name: string;
        description: React.FC<VariableTextMap>;
    };
} = {
    'simpleAttack': {
        name: 'Simple attack (test)',
        description: () => <>simpleAttack test</>
    },
    'move': {
        name: 'Move',
        description: () => <>
            Basic move.
        </>
    },
    'sword-sting': {
        name: 'Sword sting',
        description: ({ attack }) => <>
            Attack {attack()} and heal launcher by half. Increase spell attack (+2).
        </>
    },
    'side-attack': {
        name: 'Side attack',
        description: ({ attack }) => <>
            Attack {attack()} ({attack(v => v * 2)} if target is on the side).
        Change target orientation to be front of launcher.
        </>
    },
    'blood-sharing': {
        name: 'Blood sharing',
        description: ({ attack }) => <>
            Launcher loses {attack()}hp and heals targets to same value.
        </>
    },

    'switch': {
        name: 'Switch',
        description: () => <>
            Move also in diagonal. If any other character, exchange position.
        </>
    },
    'treacherous-blow': {
        name: 'Treacherous blow',
        description: ({ attack }) => <>
            On enemy, attack {attack()} ({attack(v => v * 2.5)} if target is on the back).<br />
        Push back target to 3 tiles and change its orientation to be front of launcher.
        </>
    },
    'attraction': {
        name: 'Attraction',
        description: () => <>
            Attract target to 3 tiles. Change its orientation toward launcher.
        </>
    },
    'distraction': {
        name: 'Distraction',
        description: () => <>
            Change targets orientation to middle of action area.
        </>
    },

    'slump': {
        name: 'Slump',
        description: ({ attack }) => <>
            Attack {attack()} and remove time permanently (-0.2s).
        </>
    },
    'last-resort': {
        name: 'Last resort',
        description: ({ attack }) => <>
            Attack depending to turn remaining time (from {attack()} to {attack(v => v * 10)}).
        </>
    },
    'motivation': {
        name: 'Motivation',
        description: () => <>
            Boost targets time permanently (+0.3s).
        </>
    },
};
