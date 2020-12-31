import { SerializableState } from '@timeflies/common';
import { computeChecksum } from './compute-checksum';

describe('# compute checksum', () => {

    it('gives predictable checksum', () => {
        const getState = (): Omit<SerializableState, 'checksum'> => ({
            characters: {
                foo: {
                    actionTime: 234
                } as any,
                bar: {
                    health: 100
                } as any
            },
            spells: {
                toto: {
                    duration: 200
                } as any
            }
        });

        expect(computeChecksum(getState())).toEqual(computeChecksum(getState()));
    });

    it('ignores props order', () => {
        const getFirstState = (): Omit<SerializableState, 'checksum'> => ({
            characters: {
                foo: {
                    actionTime: 234
                } as any,
                bar: {
                    health: 100
                } as any
            },
            spells: {}
        });

        const getSecondState = (): Omit<SerializableState, 'checksum'> => ({
            spells: {},
            characters: {
                bar: {
                    health: 100
                } as any,
                foo: {
                    actionTime: 234
                } as any
            }
        });

        expect(computeChecksum(getFirstState())).toEqual(computeChecksum(getSecondState()));
    });
});
