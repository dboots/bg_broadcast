import { Bid, Listing } from '@/models/listing.model';
import { BaseService } from './base.service';
import {
  QueryFieldFilterConstraint,
  WhereFilterOp,
  collection,
  doc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';

export class ListingService extends BaseService<Listing> {
  constructor() {
    super('listings');
  }

  single = async <Listing>(
    name: string,
    id: string
  ): Promise<Listing | undefined> => {
    const ref = await getDocs(
      query(collection(this.db, name), where('id', '==', id))
    );

    console.log('here', ref, this.db, name, id);
    if (ref.docs.length > 0) {
      const doc = ref.docs[0];
      return {
        id: doc.id,
        title: doc.data().title,
        description: doc.data().description,
        images: doc.data().images || [],
      } as Listing;
    }
  };

  read = async <T>(
    name: string,
    relation?: { name: string; field: string; id: string },
    clauses: { field: string; operator: WhereFilterOp; value: any }[] = []
  ): Promise<T[]> => {
    const collectionRef = collection(this.db, name);
    const constraints: QueryFieldFilterConstraint[] = [];

    // move constraints relation to base service
    if (relation) {
      const relationRef = doc(this.db, relation.name, relation.id);
      clauses.push({
        field: relation.field,
        operator: '==',
        value: relationRef,
      });
    }

    clauses.forEach((clause) => {
      constraints.push(where(clause.field, clause.operator, clause.value));
    });

    const queryRef = query(collectionRef, ...constraints);
    const ref = await getDocs(queryRef);
    let result: T[] = [];
    try {
      result = ref.docs.map((doc) => {
        return {
          id: doc.id,
          title: doc.data().title,
          description: doc.data().description || null,
          bids: doc.data().bids
            ? doc.data().bids.map((bid: Bid) => JSON.parse(JSON.stringify(bid)))
            : [],
          images: doc.data().images,
        } as T;
      });
    } catch (error) {
      console.log('error', error);
    }

    return result;
  };

  bid = async (
    userId: string,
    listing: Listing,
    amount: number
  ): Promise<Listing> => {
    //  get bids from server
    const source = await this.single<Listing>('listings', listing.id);
    if (source && source.bids && source.bids.length) {
      const highestBid = source.bids.reduce((prev, current) =>
        prev.amount > current.amount ? prev : current
      );
      if (highestBid.amount > amount) {
        throw new Error('Bid is too low');
      }
    }

    if (listing.bids) {
      listing.bids.push({
        userId,
        amount,
        date: new Date(),
      });
    } else {
      listing.bids = [
        {
          userId,
          amount,
          date: new Date(),
        },
      ];
    }

    await this.update(listing, listing.id);
    return listing;
  };
}
