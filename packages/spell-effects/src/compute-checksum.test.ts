import { SerializableState } from '@timeflies/common';
import { computeChecksum } from './compute-checksum';

describe('# compute checksum', () => {

    it('gives predictable checksum', () => {
        const getState = (): Omit<SerializableState, 'checksum'> => ({
            time: 123,
            characters: {
                foo: {
                    actionTime: 234
                },
                bar: {
                    health: 100
                }
            } as any,
            spells: {
                toto: {
                    duration: 200
                }
            } as any
        });

        expect(computeChecksum(getState())).toEqual(computeChecksum(getState()));
    });

    it('ignores props order', () => {
        const getFirstState = (): Omit<SerializableState, 'checksum'> => ({
            time: 123,
            characters: {
                foo: {
                    actionTime: 234
                },
                bar: {
                    health: 100
                }
            } as any,
            spells: {} as any
        });

        const getSecondState = (): Omit<SerializableState, 'checksum'> => ({
            spells: {} as any,
            time: 123,
            characters: {
                bar: {
                    health: 100
                },
                foo: {
                    actionTime: 234
                }
            } as any
        });

        expect(computeChecksum(getFirstState())).toEqual(computeChecksum(getSecondState()));
    });
});
