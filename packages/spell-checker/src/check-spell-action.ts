import { SerializableState } from '@timeflies/common';
import { Checker, CheckerParams } from './checker';
import { checkCharacter } from './checkers/check-character';
import { checkChecksum } from './checkers/check-checksum';
import { checkMap } from './checkers/check-map';
import { checkPlayer } from './checkers/check-player';
import { checkTime } from './checkers/check-time';

const checkers: readonly Checker[] = [
    checkChecksum,
    checkPlayer,
    checkCharacter,
    checkTime,
    checkMap
];

type ComputeNewStateFromSpellActionFn = (params: CheckSpellParams) => SerializableState;

export type CheckSpellParams = Pick<CheckerParams, 'spellAction' | 'context'>;

export type CheckSpellActionResult =
    | {
        success: true;
        newState: SerializableState;
    }
    | {
        success: false;
    };

export const getSpellActionChecker = (computeNewStateFromSpellAction: ComputeNewStateFromSpellActionFn) =>
    (params: CheckSpellParams): CheckSpellActionResult => {

        const newState = computeNewStateFromSpellAction(params);

        const checkerParams: CheckerParams = {
            ...params,
            newState
        };

        const checked = checkers.every(check => check(checkerParams));

        return checked
            ? {
                success: true,
                newState
            }
            : {
                success: false
            };
    };
