import { CharacterId, SerializableState, SpellRole } from '@timeflies/common';
import produce from 'immer';
import { computeChecksum } from './compute-checksum';
import { computeRangeArea, ComputeRangeAreaParams } from './compute-range-area';
import { createSpellEffectHelper } from './spell-effects-fn';
import { getSpellEffectFn, getSpellRangeAreaFn } from './spell-effects-map';
import { SpellEffect, SpellEffectFnParams } from './spell-effects-params';

const getDefineProp = <M extends { [ k in keyof V ]: any }, V>(source: M, characterId: CharacterId, delta: Partial<V>) =>
    <K extends keyof V>(key: K, computeFn: (prevValue: V[ K ], deltaValue: NonNullable<V[ K ]>) => V[ K ]) => {

        const deltaValue = delta[ key ];

        if (deltaValue !== undefined) {
            const variables = source[ key ] as { [ k in string ]: V[ K ] };

            const prevValue = variables[ characterId ];

            variables[ characterId ] = computeFn(prevValue, deltaValue as NonNullable<V[ K ]>);
        }
    };

export const produceStateFromSpellEffect = (
    spellEffect: SpellEffect, spellEffectParams: SpellEffectFnParams
): SerializableState => {
    return produce(spellEffectParams.context.state as SerializableState, draft => {

        Object.entries(spellEffect.characters ?? {})
            .forEach(([ characterId, characterDelta ]) => {
                const defineProp = getDefineProp(draft.characters, characterId, characterDelta);

                defineProp('health', (prevValue, deltaValue) => prevValue + deltaValue);
                defineProp('actionTime', (prevValue, deltaValue) => prevValue + deltaValue);
                defineProp('orientation', (prevValue, deltaValue) => deltaValue);
                defineProp('position', (prevValue, deltaValue) => deltaValue);
            });

        Object.entries(spellEffect.spells ?? {})
            .forEach(([ spellId, spellDelta ]) => {
                const defineProp = getDefineProp(draft.spells, spellId, spellDelta);

                defineProp('duration', (prevValue, deltaValue) => prevValue + deltaValue);
                defineProp('lineOfSight', (prevValue, deltaValue) => deltaValue);
                defineProp('rangeArea', (prevValue, deltaValue) => prevValue + deltaValue);
                defineProp('actionArea', (prevValue, deltaValue) => prevValue + deltaValue);

                defineProp('attack', (prevValue, deltaValue) => (prevValue ?? 0) + deltaValue);
            });

        draft.time = spellEffectParams.partialSpellAction.launchTime;
        draft.checksum = computeChecksum(draft);
    });
};

export const getSpellEffectFromSpellRole = async (spellRole: SpellRole, spellEffectParams: SpellEffectFnParams): Promise<SpellEffect> => {

    const spellEffectFn = getSpellEffectFn(spellRole);

    const helper = createSpellEffectHelper(spellEffectParams);

    const defaultActionArea = helper.getActionArea();
    if (defaultActionArea.length === 0) {
        return { actionArea: [], duration: -1 };
    }

    const defaultDuration = helper.getDefaultDuration();

    const spellEffect = await spellEffectFn(helper);

    return {
        actionArea: defaultActionArea,
        duration: defaultDuration,
        ...spellEffect
    };
};

export const produceStateFromSpellRole = async (
    spellRole: SpellRole, spellEffectParams: SpellEffectFnParams
) => {
    const spellEffect = await getSpellEffectFromSpellRole(spellRole, spellEffectParams);

    return produceStateFromSpellEffect(spellEffect, spellEffectParams);
};

export const getSpellRangeArea = (spellRole: SpellRole, params: ComputeRangeAreaParams) => {
    const checkTileFn = getSpellRangeAreaFn(spellRole);

    return computeRangeArea(params, checkTileFn);
};
