import firebase_app, { auth } from '@/app/firebase/config';
import { User } from 'firebase/auth';
import { useEffect, useState } from 'react';

export default function useAuth() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUser(user);
            } else {
                setUser(null);
            }
        });

        return () => unsubscribe();
    }, []);

    return user;
}
