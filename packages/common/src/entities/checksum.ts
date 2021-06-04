import * as joi from 'joi';

export type Checksum = string;
export const checksumSchema = joi.string().required().min(1);
