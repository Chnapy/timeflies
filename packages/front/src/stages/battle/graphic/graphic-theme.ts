import { appTheme } from '../../../ui/app-theme';
import { Theme } from '@material-ui/core';

type GraphicTheme = DeepStringToNumber<Pick<Theme, 'palette' | 'typography'>>;

type DeepStringToNumber<V> = string extends V ? number : (
    V extends number ? V : (
        V extends {}
        ? { [ K in keyof V ]: DeepStringToNumber<V[ K ]> }
        : V
    )
);

const createGraphicTheme = (): GraphicTheme => {

    const stringToHexaNumber = (v: string): number | string => {
        if (v[ 0 ] !== '#') {
            return v;
        }

        const sub = v.substring(1);

        if (sub.length !== 6 && sub.length !== 3) {
            throw new Error();
        }

        const finalStr = sub.length === 6
            ? sub
            : sub + sub;

        return Number.parseInt(finalStr, 16);
    };

    const compute = <O extends object>(o: O): DeepStringToNumber<O> => {
        const o2 = {};
        Object.entries(o).forEach(([ k, v ]: [ string, any ]) => {

            const typeofV = typeof v;

            if (typeofV === 'object') {
                o2[ k ] = compute(v);
            } else if (typeofV === 'string') {
                o2[ k ] = stringToHexaNumber(v);
            } else {
                o2[ k ] = v;
            }
        });

        return o2 as DeepStringToNumber<O>;
    };

    return compute({
        palette: appTheme.palette,
        typography: appTheme.typography,
    });
};

export const graphicTheme: GraphicTheme = createGraphicTheme();
