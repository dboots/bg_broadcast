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
} from '@nextui-org/react';
import _ from 'lodash';

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
                <Button color='danger' variant='light' onClick={clearSelection}>
                  Clear
                </Button>
              </div>
            </CardBody>
          </Card>
          <div>month / day / time</div>
          </>
        )}
      </div>
    </main>
  );
}
