import { Profile } from '@/models/profile.model';
import { BaseService } from './base.service';
import { collection, getDocs, query, where } from 'firebase/firestore';

export class UserService extends BaseService<Profile> {
  constructor() {
    super('profile');
  }

  single = async <Profile>(id: string): Promise<Profile | undefined> => {
    const ref = await getDocs(
      query(collection(this.db, this.name), where('uid', '==', id))
    );

    if (ref.docs.length > 0) {
      const doc = ref.docs[0];
      return {
        id: doc.id,
        uid: doc.data().uid,
        saved: doc.data().saved,
        stripeId: doc.data().stripeId,
        listings: await this.saved(doc.data().saved),
      } as Profile;
    }
  };

  saved = async <Listing>(arrSaved: string[]): Promise<Listing[]> => {
    if (arrSaved.length === 0) {
      return [];
    }

    const ref = await getDocs(
      query(collection(this.db, 'listings'), where('id', 'in', arrSaved))
    );

    if (ref.docs.length > 0) {
      return ref.docs.map((doc) => {
        return {
          id: doc.data().id,
          title: doc.data().title,
          description: doc.data().description,
          endDate: doc.data().endDate,
          bids: doc.data().bids,
        } as Listing;
      });
    }

    return [];
  };
}
