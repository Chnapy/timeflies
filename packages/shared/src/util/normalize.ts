
type Normalizable = {
    id: string;
};

export type Normalized<I extends Normalizable> = {
    [ k in I[ 'id' ] ]: I;
};

export const normalize = <I extends Normalizable>(arr: I[]): Normalized<I> =>
    arr.reduce((o, item) => {

        o[ item.id ] = item;

        return o;
    }, {} as Normalized<I>);

export const denormalize = <I extends Normalizable>(obj: Normalized<I>): I[] =>
    Object.keys(obj).map(id => obj[ id ]);
