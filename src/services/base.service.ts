import {
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  Firestore,
  addDoc,
  collection,
  doc,
  getDoc,
  getFirestore,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import firebase_app from '../app/firebase/config';

export interface HttpResponse<T> {
  result: T;
  error: any;
}

export interface IDataService<T> {
  db: Firestore;
  name: string;
  read(id: string): Promise<{ result: T[] | undefined; error: any }>;
}

export class BaseService<T extends { id?: string }> {
  db = getFirestore(firebase_app);

  serialize = (docs: DocumentSnapshot<DocumentData>[]): T[] => {
    return docs.map((doc) => {
      return {
        id: doc.id,
      } as T;
    });
  };

  name: string;

  constructor(name: string) {
    this.name = name;
  }

  read = async (collection: string): Promise<T[] | undefined> => {
    const querySnapshot = await getDoc(doc(this.db, collection));
    if (querySnapshot.exists()) {
      return this.serialize(querySnapshot.data() as DocumentSnapshot<DocumentData>[]);
    }
  };

  update = async (model: object, id: string) => {
    console.log('model', model, id);
    if (id) {
      console.log('ref', this.db, this.name, id);
      const ref = await getDoc(doc(this.db, this.name, id));
      if (ref.exists()) {
        console.log('ref', ref);
        await updateDoc(doc(this.db, this.name, id), model);
      } else {
        console.log('ref does not exist');
      }
    } else {
      throw new Error('Model does not have an id');
    }
  };

  create = async (model: T): Promise<T> => {
    console.log('model', model);
    const doc: DocumentReference<DocumentData> = await addDoc(collection(this.db, this.name), model);
    const snapshot = await getDoc(doc);
    return snapshot.data() as T;
  };
}
