// pages/index.tsx
import { useState, useEffect } from 'react';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Chip,
  Divider,
  Input,
  Spinner,
  Select,
  SelectItem,
} from '@nextui-org/react';
import Link from 'next/link';
import Head from 'next/head';
import useAuth from '@/hooks/useAuth';
import { getSupabaseClient } from '@/lib/supabase';
import ProfileService from '@/services/profile.service';
import { Profile } from '@/types';

// Interface for session data
interface GameSession {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  gameType: string;
  location: string;
  zipCode: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  hostId: string;
  hostName: string;
  playerCount: number;
  maxPlayers: number;
  distance?: number; // Added for distance calculation
}

// Mock service for nearby sessions - replace with actual service later
class NearbySessionsService {
  async getSessions(): Promise<GameSession[]> {
    // This would be replaced with an actual API call
    // Mock data for demo purposes
    return [
      {
        id: 'session1',
        title: "Dragon's Lair Adventure",
        description:
          "Join us for an epic journey through the treacherous Dragon's Lair. Brave adventurers will face cunning traps, fearsome monsters, and ultimately confront the ancient red dragon that has been terrorizing the nearby villages.",
        imageUrl: 'https://fpoimg.com/600x400?text=Game+Image',
        date: '2025-04-15T19:00:00',
        gameType: 'Dungeons & Dragons 5E',
        location: 'The Gaming Table',
        zipCode: '90210',
        status: 'upcoming',
        hostId: 'host1',
        hostName: 'Elric Stormborn',
        playerCount: 4,
        maxPlayers: 6,
      },
      {
        id: 'session2',
        title: 'Catan Championship',
        description:
          'Weekly Catan game with experienced players. All expansions available. We rotate who gets to pick the variant each week. Beginners welcome but be prepared for competitive play!',
        imageUrl: 'https://fpoimg.com/600x400?text=Catan+Image',
        date: '2025-04-10T18:30:00',
        gameType: 'Catan',
        location: 'Board Game Cafe',
        zipCode: '90220',
        status: 'upcoming',
        hostId: 'host2',
        hostName: 'Meeple Master',
        playerCount: 3,
        maxPlayers: 4,
      },
      {
        id: 'session3',
        title: 'Pandemic Legacy: Season 3',
        description:
          "Continuing our legacy campaign. New players welcome! We're on month 6 and things are getting intense. If you join, you'll be briefed on the story so far.",
        imageUrl: 'https://fpoimg.com/600x400?text=Pandemic+Image',
        date: '2025-04-12T14:00:00',
        gameType: 'Pandemic Legacy',
        location: 'Community Center',
        zipCode: '90250',
        status: 'upcoming',
        hostId: 'host3',
        hostName: 'Dr. Cure',
        playerCount: 2,
        maxPlayers: 4,
      },
      {
        id: 'session4',
        title: 'Gloomhaven Campaign',
        description:
          'Ongoing Gloomhaven campaign, currently at scenario 15. Looking for 1-2 more adventurers to join our party. Commitment to weekly sessions preferred.',
        imageUrl: 'https://fpoimg.com/600x400?text=Gloomhaven+Image',
        date: '2025-04-18T17:00:00',
        gameType: 'Gloomhaven',
        location: 'The Dungeon Room',
        zipCode: '90305',
        status: 'upcoming',
        hostId: 'host4',
        hostName: 'Dungeon Delver',
        playerCount: 3,
        maxPlayers: 4,
      },
      {
        id: 'session5',
        title: 'Magic: The Gathering Draft',
        description:
          'Hosting a booster draft for the latest MTG set. $15 entry fee covers packs and prizes. All skill levels welcome!',
        imageUrl: 'https://fpoimg.com/600x400?text=MTG+Image',
        date: '2025-04-20T13:00:00',
        gameType: 'Magic: The Gathering',
        location: 'Card Kingdom',
        zipCode: '90290',
        status: 'upcoming',
        hostId: 'host5',
        hostName: 'Planeswalker Pete',
        playerCount: 6,
        maxPlayers: 8,
      },
      {
        id: 'session6',
        title: 'Terraforming Mars Tournament',
        description:
          'Monthly Terraforming Mars tournament. Base game only, 90-minute time limit per match. Prize for the winner!',
        imageUrl: 'https://fpoimg.com/600x400?text=Terraforming+Mars',
        date: '2025-04-25T11:00:00',
        gameType: 'Terraforming Mars',
        location: 'Red Planet Games',
        zipCode: '90403',
        status: 'upcoming',
        hostId: 'host6',
        hostName: 'Cosmic Carl',
        playerCount: 12,
        maxPlayers: 16,
      },
    ];
  }
}

// Utility function to calculate distance between zip codes
const calculateDistance = (zipCode1: string, zipCode2: string): number => {
  // This is a simple mock implementation
  // In a real app, you'd use a geocoding API to convert zip codes to coordinates
  // and then calculate the actual distance

  // For demo, we'll just calculate a mock distance based on string difference
  const diff = Math.abs(parseInt(zipCode1) - parseInt(zipCode2));
  return Math.round(diff / 100); // Mock miles distance
};

export const getServerSideProps: GetServerSideProps = async () => {
  const service = new NearbySessionsService();
  const sessions = await service.getSessions();

  return {
    props: {
      initialSessions: sessions,
    },
  };
};

export default function HomePage({
  initialSessions,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const user = useAuth();
  const [profile, setProfile] = useState<Profile>();
  const [userZipCode, setUserZipCode] = useState<string>('90210'); // Default zip code
  const [sessions, setSessions] = useState<GameSession[]>(initialSessions);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [maxDistance, setMaxDistance] = useState<number>(50); // Default 50 miles
  const [gameTypeFilter, setGameTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('upcoming'); // Default to upcoming

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        try {
          const profileService = new ProfileService();
          const userProfile = await profileService.getByFieldValue<Profile>(
            'user_id',
            user.user.id
          );
          setProfile(userProfile);

          // If the user profile has a zip code, use it
          if (userProfile?.zipCode) {
            setUserZipCode(userProfile.zipCode);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      };

      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    // Update distances when user zip code changes
    if (userZipCode && userZipCode.length === 5) {
      const sessionsWithDistance = initialSessions.map((session) => ({
        ...session,
        distance: calculateDistance(userZipCode, session.zipCode),
      }));

      // Sort by distance
      const sortedSessions = sessionsWithDistance.sort(
        (a, b) => (a.distance || 999) - (b.distance || 999)
      );

      setSessions(sortedSessions);
    }
  }, [userZipCode, initialSessions]);

  // Filter sessions based on user preferences
  const filteredSessions = sessions.filter((session) => {
    // Distance filter
    if (session.distance && session.distance > maxDistance) {
      return false;
    }

    // Game type filter
    if (gameTypeFilter !== 'all' && session.gameType !== gameTypeFilter) {
      return false;
    }

    // Status filter
    if (statusFilter !== 'all' && session.status !== statusFilter) {
      return false;
    }

    return true;
  });

  // Format date for display
  const formatSessionDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Extract unique game types for filter dropdown
  const gameTypes = [...new Set(sessions.map((session) => session.gameType))];

  return (
    <>
      <Head>
        <title>Board Game Broadcast - Find Nearby Gaming Sessions</title>
        <meta
          name='description'
          content='Find and join board game sessions in your area'
        />
      </Head>

      <div className='container mx-auto px-4 py-8'>
        {/* Hero section */}
        <div className='mb-8 text-center'>
          <h1 className='text-4xl font-bold mb-4'>
            Find Board Game Sessions Near You
          </h1>
          <p className='text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto'>
            Connect with fellow board game enthusiasts, join existing sessions,
            or host your own gaming event.
          </p>
        </div>

        {/* Filters */}
        <div className='bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-8'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <div>
              <Input
                label='Your Zip Code'
                placeholder='Enter zip code'
                value={userZipCode}
                onChange={(e) => setUserZipCode(e.target.value)}
              />
            </div>

            <div>
              <Select
                label='Maximum Distance'
                placeholder='Select distance'
                selectedKeys={[maxDistance.toString()]}
                onChange={(e) => setMaxDistance(Number(e.target.value))}
              >
                <SelectItem key='10' value={10}>
                  10 miles
                </SelectItem>
                <SelectItem key='25' value={25}>
                  25 miles
                </SelectItem>
                <SelectItem key='50' value={50}>
                  50 miles
                </SelectItem>
                <SelectItem key='100' value={100}>
                  100 miles
                </SelectItem>
              </Select>
            </div>

            <div>
              <Select
                label='Game Type'
                placeholder='Select game'
                selectedKeys={[gameTypeFilter]}
                onChange={(e) => setGameTypeFilter(e.target.value)}
              >
                <SelectItem key='all' value='all'>
                  All Games
                </SelectItem>
                {gameTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div>
              <Select
                label='Status'
                placeholder='Select status'
                selectedKeys={[statusFilter]}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <SelectItem key='all' value='all'>
                  All Status
                </SelectItem>
                <SelectItem key='upcoming' value='upcoming'>
                  Upcoming
                </SelectItem>
                <SelectItem key='ongoing' value='ongoing'>
                  Ongoing
                </SelectItem>
                <SelectItem key='completed' value='completed'>
                  Completed
                </SelectItem>
              </Select>
            </div>
          </div>
        </div>

        {/* Session count */}
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-2xl font-bold'>
            {filteredSessions.length === 0
              ? 'No Sessions Found'
              : `${filteredSessions.length} Session${
                  filteredSessions.length === 1 ? '' : 's'
                } Found`}
          </h2>

          <Button color='primary' as={Link} href='/create'>
            Host New Session
          </Button>
        </div>

        {/* Results */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
          {isLoading ? (
            <div className='col-span-3 flex justify-center items-center py-20'>
              <Spinner size='lg' label='Loading sessions...' />
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className='col-span-3 bg-white dark:bg-gray-800 rounded-xl shadow p-8 text-center'>
              <h3 className='text-xl font-semibold mb-2'>No Sessions Found</h3>
              <p className='text-gray-600 dark:text-gray-400 mb-4'>
                Try adjusting your filters or search for sessions in a different
                area.
              </p>
              <Button
                color='primary'
                onClick={() => {
                  setMaxDistance(100);
                  setGameTypeFilter('all');
                  setStatusFilter('all');
                }}
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            filteredSessions.map((session) => (
              <Card
                key={session.id}
                className='bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow'
              >
                <CardHeader className='flex gap-3 overflow-hidden p-0'>
                  <div className='w-full h-40 relative'>
                    <img
                      alt={session.title}
                      className='w-full h-full object-cover'
                      src={session.imageUrl}
                    />
                    <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3'>
                      <p className='text-white text-xl font-bold line-clamp-1'>
                        {session.title}
                      </p>
                      <div className='flex mt-1 gap-2'>
                        <Chip size='sm' color='primary' variant='flat'>
                          {session.gameType}
                        </Chip>
                        <Chip
                          size='sm'
                          color={
                            session.status === 'upcoming'
                              ? 'success'
                              : session.status === 'ongoing'
                              ? 'warning'
                              : 'default'
                          }
                          variant='flat'
                        >
                          {session.status.charAt(0).toUpperCase() +
                            session.status.slice(1)}
                        </Chip>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className='grid grid-cols-2 gap-2 mb-3 text-sm'>
                    <div>
                      <p className='text-gray-500'>Date & Time</p>
                      <p className='font-medium'>
                        {formatSessionDate(session.date)}
                      </p>
                    </div>
                    <div>
                      <p className='text-gray-500'>Distance</p>
                      <p className='font-medium'>
                        {session.distance} miles away
                      </p>
                    </div>
                    <div>
                      <p className='text-gray-500'>Players</p>
                      <p className='font-medium'>
                        {session.playerCount}/{session.maxPlayers}
                      </p>
                    </div>
                    <div>
                      <p className='text-gray-500'>Host</p>
                      <p className='font-medium'>{session.hostName}</p>
                    </div>
                  </div>
                  <p className='text-gray-700 dark:text-gray-300 text-sm line-clamp-3'>
                    {session.description}
                  </p>
                </CardBody>
                <Divider />
                <CardFooter className='flex justify-between'>
                  <Button
                    as={Link}
                    href={`/session/${session.id}`}
                    color='primary'
                    variant='flat'
                  >
                    View Details
                  </Button>
                  <Button
                    color='success'
                    variant='solid'
                    isDisabled={session.playerCount >= session.maxPlayers}
                  >
                    {session.playerCount >= session.maxPlayers
                      ? 'Full'
                      : 'Join Session'}
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>

        {/* Featured content section */}
        <div className='mt-12 mb-8'>
          <h2 className='text-2xl font-bold mb-6'>
            Why Join Board Game Broadcast?
          </h2>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <Card className='bg-white dark:bg-gray-800'>
              <CardHeader className='flex gap-3'>
                <div className='flex flex-col'>
                  <p className='text-xl font-bold'>Find Local Players</p>
                </div>
              </CardHeader>
              <CardBody>
                <p>
                  Connect with board game enthusiasts in your area. Never
                  struggle to find a gaming group again!
                </p>
              </CardBody>
            </Card>

            <Card className='bg-white dark:bg-gray-800'>
              <CardHeader className='flex gap-3'>
                <div className='flex flex-col'>
                  <p className='text-xl font-bold'>Discover New Games</p>
                </div>
              </CardHeader>
              <CardBody>
                <p>
                  Join sessions featuring games you've never played before.
                  Expand your horizons and find new favorites.
                </p>
              </CardBody>
            </Card>

            <Card className='bg-white dark:bg-gray-800'>
              <CardHeader className='flex gap-3'>
                <div className='flex flex-col'>
                  <p className='text-xl font-bold'>Host Your Own Events</p>
                </div>
              </CardHeader>
              <CardBody>
                <p>
                  Create and manage your own gaming sessions. Invite others and
                  grow your local gaming community.
                </p>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* CTA section */}
        <div className='bg-primary-100 dark:bg-primary-900 rounded-xl p-8 text-center mb-12'>
          <h2 className='text-2xl font-bold mb-4'>
            Ready to Join the Community?
          </h2>
          <p className='mb-6'>
            Create an account today to join sessions or host your own events.
          </p>
          <Button
            as={Link}
            href='/login'
            color='primary'
            size='lg'
            className='font-semibold'
          >
            {user ? 'Browse More Sessions' : 'Sign Up Now'}
          </Button>
        </div>
      </div>
    </>
  );
}
