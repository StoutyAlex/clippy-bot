import 'dotenv/config';

export const prefix: string = 'sheev';

export const environment: 'test' | 'live' = process.env.NODE_ENV === 'development' ? 'test' : 'live';
