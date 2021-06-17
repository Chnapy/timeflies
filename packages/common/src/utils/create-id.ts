import { nanoid } from 'nanoid';
import { switchUtil } from './switchUtil';

export const createId = (length: 'long' | 'short' = 'long') => nanoid(switchUtil(length, {
    'long': 21,
    'short': 8
}));
