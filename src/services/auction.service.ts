import Auction from '@/models/auction.model';
import { BaseService } from './base.service';
import {
  QueryDocumentSnapshot,
  QueryFieldFilterConstraint,
  Timestamp,
  WhereFilterOp,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { Listing } from '@/models/listing.model';

const serialize = <T>(data: QueryDocumentSnapshot): T => {
  console.log(Object.assign({}, data.data()) as T);
  return {
    images: data.data().images,
  } as T;
};

export class AuctionService extends BaseService<Auction> {
  constructor() {
    super('auctions');
  }

  single = async <Auction>(
    name: string,
    id: string
  ): Promise<Auction | undefined> => {
    const ref = await getDoc(doc(this.db, name, id));

    if (ref.exists()) {
      return {
        id: ref.id,
        description: ref.data().description || null,
        endDate: (ref.data().endDate as Timestamp).toDate().toISOString(),
        increments: ref.data().increments || [],
      } as Auction;
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
      result = await Promise.all(
        ref.docs.map(async (doc) => {
          const listings = await getDocs(
            query(
              collection(this.db, 'listings'),
              where('auctionRef', '==', doc.ref)
            )
          );

          return {
            id: doc.id,
            title: doc.data().title,
            description: doc.data().description || null,
            listings: listings.docs.map((doc) => serialize<Listing>(doc)),
          } as T;
        })
      );
    } catch (error) {
      console.log('error', error);
    }

    return result;
  };
}
