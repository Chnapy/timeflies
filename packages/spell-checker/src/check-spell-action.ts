import { SerializableState } from '@timeflies/common';
import { getSpellEffectFromSpellRole, produceStateFromSpellEffect, SpellEffect } from '@timeflies/spell-effects';
import { Checker, CheckerParams } from './checker';
import { checkCharacter } from './checkers/check-character';
import { checkChecksum } from './checkers/check-checksum';
import { checkMap } from './checkers/check-map';
import { checkPlayer } from './checkers/check-player';
import { checkTime } from './checkers/check-time';

const checkers: readonly Checker[] = [
    checkPlayer,
    checkCharacter,
    checkTime,
    checkMap
];

export type CheckSpellParams = Pick<CheckerParams, 'spellAction' | 'context'> & {
    doChecksum: boolean;
};

export type CheckSpellActionResult =
    | {
        success: true;
        newState: SerializableState;
        spellEffect: SpellEffect;
    }
    | {
        success: false;
    };

export const spellActionCheck = async (params: CheckSpellParams): Promise<CheckSpellActionResult> => {
    const { spellAction, context, doChecksum } = params;

    const { spellRole } = context.staticState.spells[ spellAction.spellId ];

    const spellEffect = await getSpellEffectFromSpellRole(spellRole, {
        partialSpellAction: spellAction,
        context
    });

    const newState = produceStateFromSpellEffect(
        spellEffect,
        context.state,
        spellAction.launchTime
    );

    const everyCheckers = doChecksum
        ? [ checkChecksum, ...checkers ]
        : checkers;

    const checkerParams: CheckerParams = {
        ...params,
        newState
    };

    const checked = everyCheckers.every(check => check(checkerParams));

    return checked
        ? {
            success: true,
            newState,
            spellEffect
        }
        : {
            success: false
        };
};
