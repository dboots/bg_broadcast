import { getSupabaseClient } from '@/lib/supabase';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

export default function useAuth() {
  const [user, setUser] = useState<Session | null>(null);

  useEffect(() => {
    console.log(process.env.NEXT_PUBLIC_SUPABASE_URL);
    const supabase = getSupabaseClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        console.log(event, session);
        setUser(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return user;
}
