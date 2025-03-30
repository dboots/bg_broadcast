import { useState, useEffect, useCallback, Key } from 'react';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Spinner,
  Image,
  Chip,
  Input,
  Select,
  SelectItem,
} from '@nextui-org/react';
import _ from 'lodash';
import SessionService from '@/services/session.service';
import { useRouter } from 'next/router';

// DatePicker component
interface DatePickerProps {
  selectedDate: {
    month: number;
    day: number;
    year: number;
  };
  setSelectedDate: React.Dispatch<
    React.SetStateAction<{
      month: number;
      day: number;
      year: number;
    }>
  >;
  isLoading: boolean;
  onSchedule: () => void;
}

const DatePicker = ({
  selectedDate,
  setSelectedDate,
  isLoading,
  onSchedule,
}: DatePickerProps) => {
  // Generate month options
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  // Calculate days in the selected month
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const month = parseInt(e.target.value);
    setSelectedDate((prev) => {
      // Adjust day if it exceeds the number of days in the new month
      const daysInNewMonth = getDaysInMonth(month, prev.year);
      const day = prev.day > daysInNewMonth ? daysInNewMonth : prev.day;
      return { ...prev, month, day };
    });
  };

  const handleDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDate((prev) => ({
      ...prev,
      day: parseInt(e.target.value),
    }));
  };

  // Generate day options based on the selected month
  const generateDayOptions = () => {
    const daysInMonth = getDaysInMonth(selectedDate.month, selectedDate.year);
    return Array.from({ length: daysInMonth }, (_, i) => ({
      value: i + 1,
      label: `${i + 1}`,
    }));
  };

  const formattedDate = new Date(
    selectedDate.year,
    selectedDate.month - 1,
    selectedDate.day
  ).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className='flex flex-col space-y-4'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <Select
            label='Month'
            placeholder='Select month'
            selectedKeys={[selectedDate.month.toString()]}
            onChange={handleMonthChange}
          >
            {months.map((month) => (
              <SelectItem key={month.value} value={month.value}>
                {month.label}
              </SelectItem>
            ))}
          </Select>
        </div>
        <div>
          <Select
            label='Day'
            placeholder='Select day'
            selectedKeys={[selectedDate.day.toString()]}
            onChange={handleDayChange}
          >
            {generateDayOptions().map((day) => (
              <SelectItem key={day.value} value={day.value}>
                {day.label}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>

      <div className='bg-gray-100 p-4 rounded-lg'>
        <p className='text-sm text-gray-600'>Selected Date:</p>
        <p className='text-lg font-semibold'>{formattedDate}</p>
      </div>

      <Button
        color='primary'
        className='w-full mt-4'
        onClick={onSchedule}
        isLoading={isLoading}
        disabled={isLoading}
      >
        {isLoading ? 'Creating Session...' : 'Schedule Game Session'}
      </Button>
    </div>
  );
};

interface BoardGameResult {
  id: string;
  name: string;
  yearPublished: string;
}

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

export const getServerSideProps: GetServerSideProps<{}> = async () => {
  return { props: {} };
};

export default function Page({}: InferGetServerSidePropsType<
  typeof getServerSideProps
>) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<BoardGameResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<BoardGameResult | null>(
    null
  );
  const [gameDetails, setGameDetails] = useState<GameDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  // State for date selection
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<{
    month: number;
    day: number;
    year: number;
  }>({
    month: today.getMonth() + 1,
    day: today.getDate(),
    year: today.getFullYear(),
  });

  const fetchBoardGames = useCallback(
    _.debounce(async (query: string) => {
      if (query.length < 2) {
        setSearchResults([]);
        setIsLoading(false);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/boardgame-search?q=${encodeURIComponent(query)}`
        );

        if (!response.ok) {
          throw new Error(`Search failed with status: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        setSearchResults(data.results || []);

        if (data.results && data.results.length === 0) {
          setError('No games found matching your search');
        }
      } catch (error) {
        console.error('Error searching board games:', error);
        setError(
          error instanceof Error ? error.message : 'Failed to search games'
        );
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 1000),
    []
  );

  // Function to fetch game details
  const fetchGameDetails = async (gameId: string) => {
    setLoadingDetails(true);
    setDetailsError(null);
    setGameDetails(null);

    try {
      const response = await fetch(`/api/boardgame-details?id=${gameId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch game details: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setGameDetails(data.gameDetails);
    } catch (error) {
      console.error('Error fetching game details:', error);
      setDetailsError(
        error instanceof Error ? error.message : 'Failed to load game details'
      );
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    if (searchTerm) {
      fetchBoardGames(searchTerm);
    } else {
      setSearchResults([]);
      setError(null);
    }
  }, [searchTerm, fetchBoardGames]);

  const handleSelectionChange = (key: Key): any => {
    const selected = searchResults.find((game) => game.id === key);
    if (selected) {
      setSelectedGame(selected);
      fetchGameDetails(selected.id);
    }
  };

  const clearSelection = () => {
    setSelectedGame(null);
    setGameDetails(null);

    // Reset date selection to today
    const today = new Date();
    setSelectedDate({
      month: today.getMonth() + 1,
      day: today.getDate(),
      year: today.getFullYear(),
    });
  };

  const handleScheduleSession = async () => {
    if (!selectedGame || !gameDetails) return;

    const formattedDate = new Date(
      selectedDate.year,
      selectedDate.month - 1,
      selectedDate.day
    ).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Set loading state while we fetch the slug
    setIsLoading(true);

    try {
      // Call the random-slug API to get a unique slug for this session
      const response = await fetch('/api/slug');

      if (!response.ok) {
        throw new Error(`Failed to generate session slug: ${response.status}`);
      }

      const data = await response.json();
      const sessionSlug = data.slug;

      const service = new SessionService();
      const session = await service.create({
        slug: sessionSlug,
        game: selectedGame.name,
        session_date: formattedDate,
        bgg_id: parseInt(selectedGame.id),
        players: null, // TODO: Add player management
        description: null, // TODO: Add description management
        is_public: true, // TODO: Add public/private toggle
        zip: null, // TODO: Add zip code management
      });

      router.push(`/session/${sessionSlug}`);
    } catch (error) {
      console.error('Error generating session slug:', error);
      alert('Failed to create game session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to render a list of items with chips
  const renderChipList = (items: string[], color: any) => {
    return (
      <div className='flex flex-wrap gap-1 mt-1'>
        {items.map((item, index) => (
          <Chip key={index} size='sm' color={color} variant='flat'>
            {item}
          </Chip>
        ))}
      </div>
    );
  };

  return (
    <main className='max-w-screen-xl min-h-screen mx-auto'>
      <div className='flex flex-col items-center justify-center px-4 py-8'>
        <h1 className='text-2xl font-bold mb-6'>Board Game Search</h1>

        <div className='w-full max-w-md mb-8'>
          <Autocomplete
            label='Search BoardGameGeek'
            placeholder='Type to search for board games...'
            className='max-w-md'
            isLoading={isLoading}
            onInputChange={(value) => setSearchTerm(value)}
            onSelectionChange={handleSelectionChange}
            errorMessage={error}
            description='Search will begin after 1 second of typing'
          >
            {searchResults.map((game) => (
              <AutocompleteItem
                key={game.id}
                textValue={game.name}
                value={game.id}
              >
                <div className='flex flex-col'>
                  <span className='text-medium'>{game.name}</span>
                  {game.yearPublished && (
                    <span className='text-small text-default-400'>
                      Published in {game.yearPublished}
                    </span>
                  )}
                </div>
              </AutocompleteItem>
            ))}
          </Autocomplete>
        </div>

        {selectedGame && (
          <>
            <Card className='w-full max-w-3xl mb-8'>
              <CardHeader className='flex gap-3'>
                <div className='flex flex-col'>
                  <p className='text-md'>Selected Game</p>
                  <p className='text-xl font-bold'>
                    {selectedGame.name}
                    {selectedGame.yearPublished &&
                      ` (${selectedGame.yearPublished})`}
                  </p>
                </div>
              </CardHeader>
              <Divider />
              <CardBody>
                {loadingDetails && (
                  <div className='flex justify-center items-center py-8'>
                    <Spinner label='Loading game details...' />
                  </div>
                )}

                {detailsError && (
                  <div className='text-red-500 py-4'>
                    Error loading game details: {detailsError}
                  </div>
                )}

                {gameDetails && (
                  <div className='flex flex-col md:flex-row gap-6'>
                    <div className='md:w-1/3'>
                      {gameDetails.image ? (
                        <Image
                          src={gameDetails.image}
                          alt={gameDetails.name}
                          className='object-contain w-full'
                        />
                      ) : (
                        <div className='bg-gray-200 h-64 flex items-center justify-center rounded-lg'>
                          <p className='text-gray-500'>No image available</p>
                        </div>
                      )}

                      <div className='mt-4 space-y-2'>
                        <div>
                          <p className='text-sm font-semibold'>Players</p>
                          <p>
                            {gameDetails.minPlayers} - {gameDetails.maxPlayers}
                          </p>
                        </div>

                        <div>
                          <p className='text-sm font-semibold'>Playing Time</p>
                          <p>{gameDetails.playingTime} minutes</p>
                        </div>

                        <div>
                          <p className='text-sm font-semibold'>Age</p>
                          <p>{gameDetails.minAge}+</p>
                        </div>
                      </div>
                    </div>

                    <div className='md:w-2/3'>
                      <h3 className='text-lg font-bold mb-2'>Description</h3>
                      <p
                        className='text-sm mb-4'
                        style={{ maxHeight: '200px', overflow: 'auto' }}
                      >
                        {gameDetails.description || 'No description available.'}
                      </p>

                      {gameDetails.designers?.length > 0 && (
                        <div className='mb-3'>
                          <h4 className='text-sm font-bold'>Designers</h4>
                          {renderChipList(gameDetails.designers, 'primary')}
                        </div>
                      )}

                      {gameDetails.mechanics?.length > 0 && (
                        <div className='mb-3'>
                          <h4 className='text-sm font-bold'>Mechanics</h4>
                          {renderChipList(gameDetails.mechanics, 'warning')}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className='flex justify-end mt-4 gap-2'>
                  <Button
                    color='primary'
                    onClick={() =>
                      window.open(
                        `https://boardgamegeek.com/boardgame/${selectedGame.id}`,
                        '_blank'
                      )
                    }
                  >
                    View on BoardGameGeek
                  </Button>
                  <Button
                    color='danger'
                    variant='light'
                    onClick={clearSelection}
                  >
                    Clear
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* Date Selection Card */}
            {gameDetails && (
              <Card className='w-full max-w-3xl mb-8'>
                <CardHeader>
                  <div className='flex flex-col'>
                    <p className='text-md'>Schedule Game Session</p>
                    <p className='text-xl font-bold'>
                      Select Date for {selectedGame?.name}
                    </p>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody>
                  <DatePicker
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    isLoading={isLoading}
                    onSchedule={handleScheduleSession}
                  />
                </CardBody>
              </Card>
            )}
          </>
        )}
      </div>
    </main>
  );
}
