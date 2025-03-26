import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import moment from 'moment';
import { getSupabaseClient } from '@/lib/supabase';
import { Player, Profile, Session } from '@/types';

type PlayerType = Player & { profile: Profile | null };

type QueryType = Omit<Session, 'players'> & {
  players: PlayerType[];
};

export const getServerSideProps: GetServerSideProps<{
  session: QueryType | null;
}> = async (context) => {
  const supabase = getSupabaseClient();

  const query = supabase
    .from('session')
    .select('*, players:players(*, profile(*))')
    .eq('slug', context.params?.slug)
    .single();

  const { data, error } = await query;
  const queryData = data as QueryType;
  if (!data) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      session: data,
    },
  };
};

export default function Page({
  session,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <div>
      <h1>{session?.game}</h1>
      <p>{session?.description}</p>
      <p>{moment(session?.session_date).format('MMM d Y')}</p>
      {session?.players?.map((p) => (
        <div key={p.id}>
          {p.guest || p.profile?.name} <br />
        </div>
      ))}
    </div>
  );
}
