
export type EnvManager<K extends string> = {
    readonly [ key in K ]: string;
};

/**
 * Check presence of required env variables,
 * throw error if not.
 * 
 * Return object filled by these variables.
 */
export const EnvManager = <K extends string>(...requiredKeys: K[]): EnvManager<K> => {

    const missingKeys: K[] = [];
    const envObject = requiredKeys.reduce<any>((acc, k) => {
        const v = process.env[ k as any ];

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
