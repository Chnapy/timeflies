import { assignKeepGetSet } from './assign-keep-get-set';

describe('# assign-keep-get-set', () => {

    it('should merge basic object', () => {

        expect(
            assignKeepGetSet({
                toto: 8
            }, {
                toto: 9,
                tutu: 'tata'
            })
        ).toEqual({
            toto: 9,
            tutu: 'tata'
        });
    });

    it('should handle getters', () => {

        let value = 9;

        const o = assignKeepGetSet({
            toto: 8
        }, {
            get toto() {
                return value;
            },
            tutu: 'tata'
        });

        expect(o.toto).toBe(9);

        value = 12;

        expect(o.toto).toBe(12);
    });

    it('should handle setters', () => {

        const setter = jest.fn();

        const o = assignKeepGetSet({}, {
            set toto(v: number) {
                setter(v);
            },
            tutu: 'tata'
        });

        o.toto = 9;

        expect(setter).toHaveBeenNthCalledWith(1, 9);
    });

    it('should handle multiple objects merge', () => {
        expect(
            assignKeepGetSet(
                {
                    toto: 9
                },
                {
                    get toto() {
                        return 8;
                    },
                    tata: 6
                },
                {
                    toto: 12,
                    get tata() {
                        return 7;
                    },
                    set tata(v: number) {

                    },
                    tutu: ''
                }
            )
        ).toEqual({
            toto: 12,
            tata: 7,
            tutu: ''
        });
    });
});
