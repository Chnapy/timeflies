export * from './TimerTester';
export * from './TiledMap.seed';

export const waitTimeout = (ms: number) => new Promise(r => setTimeout(r, ms));
