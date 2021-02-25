
export type Normalizable = {
    id: string;
};

export type Normalized<I extends Normalizable> = {
    [ k in I[ 'id' ] ]: I;
};

export const normalize = <I extends Record<string | number, any>, IK extends keyof I>(arr: I[], idKey: IK): { [ id in I[ IK ] ]: I } =>
    arr.reduce((acc, item) => {
        acc[ item[ idKey ] ] = item;
        return acc;
    }, {} as { [ id in I[ IK ] ]: I });
