export interface Listing {
  id: string;
  title: string;
  description: string;
  endDate: Date;
  bids: Bid[];
  images: string[];
}

export interface Bid {
  userId: string;
  amount: number;
  date: Date | { seconds: number; nanoseconds: number };
}
