import { createCache } from '@timeflies/cache';
import * as PIXI from 'pixi.js';

export const textureCache = createCache<number, PIXI.Texture>();
