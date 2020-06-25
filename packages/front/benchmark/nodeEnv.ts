
// Workaround to make benchmarks in production env
// Since jest fails if we set NODE_ENV in script command
(process.env.NODE_ENV as any) = 'production';

export {};
