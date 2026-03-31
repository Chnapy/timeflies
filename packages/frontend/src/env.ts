
const requiredKeys = [ 'VITE_SERVER_URL' ] as const;

console.table(requiredKeys.reduce<Record<string, any>>((acc, key) => {
    acc[ key ] = import.meta.env[ key ];
    return acc;
}, { '<env keys>': '' }));

if (requiredKeys.some(key => !import.meta.env[ key ])) {
    throw new Error('Env variables are missing.\nRequired: ' + JSON.stringify(requiredKeys));
}

export const getEnv = (envKey: typeof requiredKeys[ number ]) => import.meta.env[ envKey ]!;
