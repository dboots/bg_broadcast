import useAuth from '@/hooks/useAuth';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { Button } from '@nextui-org/react';
import { Profile } from '@/types';
import ProfileService from '@/services/profile.service';

// Define Game Session interface
interface GameSession {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  players: Player[];
  gameType: string;
  location: string;
  status: 'upcoming' | 'ongoing' | 'completed';
}

interface Player {
  id: string;
  name: string;
  avatarUrl: string;
  role: string;
}

// Mock service for game sessions - replace with actual service later
class SessionService {
  async getSession(slug: string): Promise<GameSession | null> {
    // This would be replaced with an actual API call
    // Mock data for demo purposes
    return {
      id: slug,
      title: "Dragon's Lair Adventure",
      description:
        "Join us for an epic journey through the treacherous Dragon's Lair. Brave adventurers will face cunning traps, fearsome monsters, and ultimately confront the ancient red dragon that has been terrorizing the nearby villages.",
      imageUrl: 'https://fpoimg.com/600x400?text=Game+Image',
      date: '2025-04-15T19:00:00',
      players: [
        {
          id: 'player1',
          name: 'Elric Stormborn',
          avatarUrl:
            'https://fpoimg.com/100x100?text=P1&bg_color=742f8a&text_color=ffffff',
          role: 'Dungeon Master',
        },
        {
          id: 'player2',
          name: 'Thorn Ironshield',
          avatarUrl:
            'https://fpoimg.com/100x100?text=P2&bg_color=3f88c5&text_color=ffffff',
          role: 'Dwarf Paladin',
        },
        {
          id: 'player3',
          name: 'Lyra Moonshadow',
          avatarUrl:
            'https://fpoimg.com/100x100?text=P3&bg_color=e76f51&text_color=ffffff',
          role: 'Elven Ranger',
        },
        {
          id: 'player4',
          name: 'Zephyr Quickfingers',
          avatarUrl:
            'https://fpoimg.com/100x100?text=P4&bg_color=2a9d8f&text_color=ffffff',
          role: 'Halfling Rogue',
        },
      ],
      gameType: 'Dungeons & Dragons 5E',
      location: 'The Gaming Table',
      status: 'upcoming',
    };
  }
}

export const getServerSideProps: GetServerSideProps<{
  session: GameSession | null;
}> = async (context) => {
  const service = new SessionService();
  const session = await service.getSession(context.params?.slug as string);

  return { props: { session } };
};

export default function SessionPage({
  session,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const user = useAuth();
  const [profile, setProfile] = useState<Profile>();
  const profileService = new ProfileService();

  useEffect(() => {
    if (user) {
      const initProfile = async () => {
        const userProfile = await profileService.getByFieldValue<Profile>('user_id', user.user.id);
        setProfile(userProfile);
      };

      initProfile();
    }
  }, [user]);

  if (!session) {
    return (
      <div className='flex flex-col items-center justify-center h-screen'>
        <h1 className='text-2xl font-bold text-red-600'>Session not found</h1>
        <p className='mt-4'>
          The session you're looking for doesn't exist or has been removed.
        </p>
      </div>
    );
  }

  // Format the session date
  const sessionDate = new Date(session.date);
  const formattedDate = sessionDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedTime = sessionDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <>
      <Head>
        <title>{session.title} | Game Session</title>
        <meta name='description' content={session.description} />
      </Head>

      <div className='container mx-auto px-4 py-8 max-w-6xl'>
        {/* Game Banner and Title */}
        <div className='relative mb-8'>
          <div className='w-full h-64 md:h-80 rounded-xl overflow-hidden'>
            <img
              src={session.imageUrl}
              alt={session.title}
              className='w-full h-full object-cover'
            />
          </div>
          <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6'>
            <h1 className='text-3xl md:text-4xl font-bold text-white'>
              {session.title}
            </h1>
            <div className='flex items-center mt-2'>
              <span className='bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium'>
                {session.gameType}
              </span>
              <span
                className={`ml-3 px-3 py-1 rounded-full text-sm font-medium ${
                  session.status === 'upcoming'
                    ? 'bg-green-600 text-white'
                    : session.status === 'ongoing'
                    ? 'bg-yellow-500 text-black'
                    : 'bg-gray-600 text-white'
                }`}
              >
                {session.status.charAt(0).toUpperCase() +
                  session.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {/* Left Column - Session Details */}
          <div className='md:col-span-2 space-y-6'>
            <div className='bg-white dark:bg-gray-800 rounded-xl shadow p-6'>
              <h2 className='text-2xl font-bold mb-4'>About This Session</h2>
              <p className='text-gray-700 dark:text-gray-300'>
                {session.description}
              </p>
            </div>

            <div className='bg-white dark:bg-gray-800 rounded-xl shadow p-6'>
              <h2 className='text-2xl font-bold mb-4'>Session Details</h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                    Date
                  </h3>
                  <p className='mt-1 text-lg'>{formattedDate}</p>
                </div>
                <div>
                  <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                    Time
                  </h3>
                  <p className='mt-1 text-lg'>{formattedTime}</p>
                </div>
                <div>
                  <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                    Game System
                  </h3>
                  <p className='mt-1 text-lg'>{session.gameType}</p>
                </div>
                <div>
                  <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                    Location
                  </h3>
                  <p className='mt-1 text-lg'>{session.location}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Players */}
          <div className='md:col-span-1'>
            <div className='bg-white dark:bg-gray-800 rounded-xl shadow p-6'>
              <h2 className='text-2xl font-bold mb-4'>Players</h2>
              <div className='space-y-4'>
                {session.players.map((player) => (
                  <div key={player.id} className='flex items-center space-x-4'>
                    <div className='flex-shrink-0'>
                      <img
                        src={player.avatarUrl}
                        alt={player.name}
                        className='w-12 h-12 rounded-full border-2 border-gray-200'
                      />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-gray-900 dark:text-white truncate'>
                        {player.name}
                      </p>
                      <p className='text-sm text-gray-500 dark:text-gray-400 truncate'>
                        {player.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Join Session Button */}
              <div className='mt-6'>
                <Button
                  color='primary'
                  size='lg'
                  className='w-full'
                  variant='solid'
                >
                  Join Session
                </Button>
              </div>
            </div>

            {/* Session Actions */}
            <div className='bg-white dark:bg-gray-800 rounded-xl shadow p-6 mt-6'>
              <h2 className='text-xl font-bold mb-4'>Session Actions</h2>
              <div className='space-y-3'>
                <Button color='secondary' className='w-full' variant='flat'>
                  Chat with Players
                </Button>
                <Button color='default' className='w-full' variant='flat'>
                  View Resources
                </Button>
                <Button color='warning' className='w-full' variant='flat'>
                  Report Issue
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
