import { en } from './en';

export type TKey = keyof typeof en;

export type Locale = 'en' | 'ur';

export type Vars = Record<string, string | number>;

export type TFunc = (key: string, vars?: Vars) => string;