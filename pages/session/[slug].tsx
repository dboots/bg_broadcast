import useAuth from '@/hooks/useAuth';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { Button, Spinner } from '@nextui-org/react';
import { Profile } from '@/types';
import ProfileService from '@/services/profile.service';
import SessionService from '@/services/session.service';
import LoadingGameDetails from '@/app/components/shared/LoadingGameDetails';

// Define Game Session interface
interface GameSession {
  id: string;
  slug: string;
  title: string;
  description?: string;
  imageUrl?: string;
  date: string;
  players?: Player[];
  gameType: string;
  location?: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  game: string; // This will store the game name
  bgg_id?: string; // Optional BGG ID if available
  session_date: string;
}

interface Player {
  id: string;
  name: string;
  avatarUrl: string;
  role: string;
}

// Interface for BGG game details
interface GameDetails {
  id: string;
  name: string;
  yearPublished: string;
  description: string;
  image: string;
  thumbnail: string;
  minPlayers: string;
  maxPlayers: string;
  playingTime: string;
  minAge: string;
  designers: string[];
  categories: string[];
  mechanics: string[];
  publishers: string[];
}

export const getServerSideProps: GetServerSideProps<{
  session: GameSession | null;
}> = async (context) => {
  const slug = context.params?.slug as string;

  // Initialize session service
  const service = new SessionService();

  try {
    // Get session from database by slug
    const session = await service.getByFieldValue<GameSession>('slug', slug);

    return { props: { session } };
  } catch (error) {
    console.error('Error fetching session:', error);
    return { props: { session: null } };
  }
};

export default function SessionPage({
  session,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const user = useAuth();
  const [profile, setProfile] = useState<Profile>();
  const [gameDetails, setGameDetails] = useState<GameDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const profileService = new ProfileService();

  // Format the session date
  const formatSessionDate = (dateString: string) => {
    const sessionDate = new Date(dateString);
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

    return { formattedDate, formattedTime };
  };

  // Function to search for game by name and get details
  const searchGameAndGetDetails = async (bggId: string) => {
    setIsLoadingDetails(true);
    setDetailsError(null);

    try {
      // First search for the game to get its ID
      const detailsResponse = await fetch(
        `/api/boardgame-details?id=${encodeURIComponent(bggId)}`
      );

      if (!detailsResponse.ok) {
        throw new Error(`Search failed with status: ${detailsResponse.status}`);
      }

      const detailsData = await detailsResponse.json();

      console.log(detailsData);

      if (!detailsData.gameDetails) {
        throw new Error('Game details not available');
      }

      setGameDetails(detailsData.gameDetails);
    } catch (error) {
      console.error('Error fetching game details:', error);
      setDetailsError(
        error instanceof Error ? error.message : 'Failed to load game details'
      );
    } finally {
      setIsLoadingDetails(false);
    }
  };

  useEffect(() => {
    if (user) {
      const initProfile = async () => {
        try {
          const userProfile = await profileService.getByFieldValue<Profile>(
            'user_id',
            user.user.id
          );
          setProfile(userProfile);
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      };

      initProfile();
    }
  }, [user]);

  useEffect(() => {
    if (session?.game) {
      // Get game details from BoardGameGeek
      searchGameAndGetDetails(session.bgg_id!);
    }
  }, [session]);

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

  // Use game details or fallbacks
  const displayTitle = session.title || session.game;
  const displayImage =
    gameDetails?.image || 'https://fpoimg.com/600x400?text=Game+Image';
  const displayDescription =
    session.description ||
    gameDetails?.description ||
    'No description available';
  const displayGameType = gameDetails?.name || session.gameType || session.game;
  const { formattedDate, formattedTime } = formatSessionDate(
    session.session_date
  );

  // Mock players for now - in a real app, this would come from the database
  const mockPlayers = [
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
  ];

  const displayPlayers = session.players || mockPlayers;

  return (
    <>
      <Head>
        <title>{displayTitle} | Game Session</title>
        <meta
          name='description'
          content={displayDescription.substring(0, 160)}
        />
      </Head>

      <div className='container mx-auto px-4 py-8 max-w-6xl'>
        {/* Game Banner and Title */}
        <div className='relative mb-8'>
          <div className='w-full h-64 md:h-80 rounded-xl overflow-hidden'>
            <img
              src={displayImage}
              alt={displayTitle}
              className='w-full h-full object-cover'
            />
          </div>
          <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6'>
            <h1 className='text-3xl md:text-4xl font-bold text-white'>
              {displayTitle}
            </h1>
            <div className='flex items-center mt-2'>
              <span className='bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium'>
                {displayGameType}
              </span>
              <span
                className={`ml-3 px-3 py-1 rounded-full text-sm font-medium bg-green-600 text-white`}
              >
                Upcoming
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
                {displayDescription}
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
                  <p className='mt-1 text-lg'>{displayGameType}</p>
                </div>
                <div>
                  <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                    Location
                  </h3>
                  <p className='mt-1 text-lg'>{session.location || 'TBD'}</p>
                </div>
              </div>
            </div>

            {/* Game Details Section with loading states */}
            {isLoadingDetails ? (
              <LoadingGameDetails />
            ) : detailsError ? (
              <LoadingGameDetails error={detailsError} />
            ) : gameDetails ? (
              <div className='bg-white dark:bg-gray-800 rounded-xl shadow p-6'>
                <h2 className='text-2xl font-bold mb-4'>Game Details</h2>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {gameDetails.yearPublished && (
                    <div>
                      <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                        Year Published
                      </h3>
                      <p className='mt-1 text-lg'>
                        {gameDetails.yearPublished}
                      </p>
                    </div>
                  )}
                  {gameDetails.playingTime && (
                    <div>
                      <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                        Playing Time
                      </h3>
                      <p className='mt-1 text-lg'>
                        {gameDetails.playingTime} minutes
                      </p>
                    </div>
                  )}
                  {gameDetails.minPlayers && gameDetails.maxPlayers && (
                    <div>
                      <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                        Players
                      </h3>
                      <p className='mt-1 text-lg'>
                        {gameDetails.minPlayers} - {gameDetails.maxPlayers}
                      </p>
                    </div>
                  )}
                  {gameDetails.minAge && (
                    <div>
                      <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                        Age
                      </h3>
                      <p className='mt-1 text-lg'>{gameDetails.minAge}+</p>
                    </div>
                  )}
                </div>

                {gameDetails.designers && gameDetails.designers.length > 0 && (
                  <div className='mt-4'>
                    <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                      Designers
                    </h3>
                    <p className='mt-1 text-lg'>
                      {gameDetails.designers.join(', ')}
                    </p>
                  </div>
                )}

                {gameDetails.mechanics && gameDetails.mechanics.length > 0 && (
                  <div className='mt-4'>
                    <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                      Mechanics
                    </h3>
                    <div className='mt-1 flex flex-wrap gap-1'>
                      {gameDetails.mechanics.map((mechanic, index) => (
                        <span
                          key={index}
                          className='bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm'
                        >
                          {mechanic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {gameDetails.categories &&
                  gameDetails.categories.length > 0 && (
                    <div className='mt-4'>
                      <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                        Categories
                      </h3>
                      <div className='mt-1 flex flex-wrap gap-1'>
                        {gameDetails.categories.map((category, index) => (
                          <span
                            key={index}
                            className='bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm'
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                <div className='mt-6'>
                  <Button
                    as='a'
                    href={`https://boardgamegeek.com/boardgame/${gameDetails.id}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    color='primary'
                    variant='flat'
                    size='sm'
                  >
                    View on BoardGameGeek
                  </Button>
                </div>
              </div>
            ) : null}
          </div>

          {/* Right Column - Players */}
          <div className='md:col-span-1'>
            <div className='bg-white dark:bg-gray-800 rounded-xl shadow p-6'>
              <h2 className='text-2xl font-bold mb-4'>Players</h2>
              <div className='space-y-4'>
                {displayPlayers.map((player) => (
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
