import { Listing } from './listing.model';

export interface Profile {
    id?: string;
    uid: string;
    saved?: string[];
    listings?: Listing[];
    stripeId?: string | undefined;
};