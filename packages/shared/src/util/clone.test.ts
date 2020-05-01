import { clone } from './clone';

describe('# clone', () => {

    it('should return primitives', () => {

        expect(clone(undefined)).toBe(undefined);
        expect(clone(null)).toBe(null);
        expect(clone(true)).toBe(true);
        expect(clone(0)).toBe(0);
        expect(clone('')).toBe('');
    });

    it('should copy primitive arrays', () => {

        const array: readonly string[] = [
            'toto', 'tata', 'tutu'
        ];

        expect(clone(array)).not.toBe(array);
        expect(clone(array)).toEqual(array);
    });

    it('should throw error on object with function', () => {

        expect(() => clone({
            fn: () => {

            }
        } as any)).toThrowError();
    });

    it('should copy class with no functions', () => {

        class Test {
            v: number;
            constructor() {
                this.v = 9;
            }
        }

        expect(clone(new Test() as any)).toEqual({ v: 9 });
    });

    it('should copy objects', () => {

        const object = {
            test1: 8,
            toto: "test",
            isActive: false
        };

        expect(clone(object)).not.toBe(object);
        expect(clone(object)).toEqual(object);
    });

    it('should copy complex objects', () => {

        const object = {
            test1: 8,
            toto: "test",
            isActive: false,
            innerObj: {
                array: [
                    { type: 'test' },
                    {
                        0: 7,
                        23: 8
                    }
                ]
            }
        };

        expect(clone(object)).not.toBe(object);
        expect(clone(object)).toEqual(object);
    });
});
