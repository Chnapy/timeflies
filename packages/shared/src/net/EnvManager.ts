
export type EnvManager<K extends string> = {
    readonly [ key in K ]: string;
};

const getStorybookFilledEnv = (requiredKeys: string[]) => requiredKeys.reduce((acc, k) => {

    if(acc[k] === undefined) {
        acc[k] = 'placeholder';
    }

    return acc;
}, {...process.env});


/**
 * Check presence of required env variables,
 * throw error if not (unless storybook context).
 * 
 * Return object filled by these variables.
 */
export const EnvManager = <K extends string>(...requiredKeys: K[]): EnvManager<K> => {

    const storybookContext = !!process.env['STORYBOOK_CONTEXT'];

    const env = storybookContext
        ? getStorybookFilledEnv(requiredKeys)
        : process.env;

    const missingKeys: K[] = [];
    const envObject = requiredKeys.reduce<any>((acc, k) => {
        const v = env[ k as any ];

        if (!v) {
            missingKeys.push(k);
        }

        acc[ k ] = v;

        return acc;
    }, {});

    console.log('env', envObject);

    if (missingKeys.length) {
        const errorMessage = `Missing required env variables:${missingKeys.map(k => `\n\t- ${k}`)}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }

    return envObject;
};
