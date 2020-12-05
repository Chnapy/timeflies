import { SerializableState, SpellRole } from '@timeflies/common';
import produce from 'immer';
import { computeChecksum } from './compute-checksum';
import { createSpellEffectHelper } from './spell-effects-fn';
import { getSpellEffectFn } from './spell-effects-map';
import { SpellEffect, SpellEffectFnParams } from './spell-effects-params';

const getDefineProp = <O>(source: O, delta: Partial<O>) =>
    <K extends keyof O>(key: K, computeFn: (prevValue: O[ K ], deltaValue: NonNullable<O[ K ]>) => O[ K ]) => {

        const deltaValue = delta[ key ];

        if (deltaValue !== undefined) {
            const prevValue = source[ key ];

            source[ key ] = computeFn(prevValue, deltaValue as NonNullable<O[ K ]>);
        }
    };

export const produceStateFromSpellEffect = (
    spellEffect: SpellEffect, spellEffectParams: SpellEffectFnParams
): SerializableState => {
    return produce(spellEffectParams.context.state, draft => {

        Object.entries(spellEffect.characters ?? {})
            .forEach(([ characterId, characterDelta ]) => {
                const defineProp = getDefineProp(draft.characters[ characterId ], characterDelta);

                defineProp('life', (prevValue, deltaValue) => prevValue + deltaValue);
                defineProp('actionTime', (prevValue, deltaValue) => prevValue + deltaValue);
                defineProp('orientation', (prevValue, deltaValue) => deltaValue);
                defineProp('position', (prevValue, deltaValue) => deltaValue);
            });

        Object.entries(spellEffect.spells ?? {})
            .forEach(([ spellId, spellDelta ]) => {
                const defineProp = getDefineProp(draft.spells[ spellId ], spellDelta);

                defineProp('duration', (prevValue, deltaValue) => prevValue + deltaValue);
                defineProp('lineOfSight', (prevValue, deltaValue) => deltaValue);
                defineProp('rangeArea', (prevValue, deltaValue) => prevValue + deltaValue);
                defineProp('actionArea', (prevValue, deltaValue) => prevValue + deltaValue);

                defineProp('attack', (prevValue, deltaValue) => (prevValue ?? 0) + deltaValue);
            });

        draft.checksum = computeChecksum(draft);
    });
};

export const produceStateFromSpellRole = (
    spellRole: SpellRole, spellEffectParams: SpellEffectFnParams
) => {
    const spellEffectFn = getSpellEffectFn(spellRole);

    const helper = createSpellEffectHelper(spellEffectParams);

    const spellEffect = spellEffectFn(helper);

    return produceStateFromSpellEffect(spellEffect, spellEffectParams);
};
