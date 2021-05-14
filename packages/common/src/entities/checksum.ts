import { string } from 'joi';

export type Checksum = string;
export const checksumSchema = string().required().min(1);
