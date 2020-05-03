
const mockEnv: NodeJS.ProcessEnv = {
    PORT: '1234',
    HOST_URL: 'placeholder'
};

Object.assign(process.env, mockEnv);
