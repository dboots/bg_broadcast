import { Listing } from './listing.model';

export default interface Auction {
  id: string;
  description: string;
  endDate: string;
  listings: Listing[];
  increments: { start: number; end: number; increment: number }[];
}
