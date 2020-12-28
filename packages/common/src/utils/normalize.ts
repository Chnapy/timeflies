
export type Normalizable = {
    id: string;
};

export type Normalized<I extends Normalizable> = {
    [ k in I[ 'id' ] ]: I;
};
