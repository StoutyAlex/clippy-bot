import 'dotenv/config';
import { version as botVersion } from '../package.json';

export const prefix: string = 'sheev';
export const version: string = botVersion;
export const defaultVolume: number = 100;

export const environment: 'test' | 'live' = process.env.NODE_ENV === 'development' ? 'test' : 'live';
