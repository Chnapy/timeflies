
const requiredKeys = [ 'REACT_APP_SERVER_URL' ] as const;

console.table(requiredKeys.reduce<Record<string, any>>((acc, key) => {
    acc[ key ] = process.env[ key ];
    return acc;
}, { '<env keys>': '' }));

if (requiredKeys.some(key => !process.env[ key ])) {
    throw new Error('Env variables are missing.\nRequired: ' + JSON.stringify(requiredKeys));
}

export const getEnv = (envKey: typeof requiredKeys[ number ]) => process.env[ envKey ]!;
