
const mockEnv: NodeJS.ProcessEnv = {
    PORT: '1234',
    HOST_URL: 'placeholder',
    JWT_PRIVATE_KEY: 'foo'
};

Object.assign(process.env, mockEnv);
