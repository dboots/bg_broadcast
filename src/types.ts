import { Tables } from '../database.types';

export type Profile = Tables<'profile'>;
export type Session = Omit<Tables<'session'>, 'created_at'>;
export type Player = Tables<'players'>;
