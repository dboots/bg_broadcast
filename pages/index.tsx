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
} from '@nextui-org/react';
import _ from 'lodash';

interface BoardGameResult {
  id: string;
  name: string;
  yearPublished: string;
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
      console.log('Selected game:', selected);
    }
  };

  const clearSelection = () => {
    setSelectedGame(null);
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
          <Card className='w-full max-w-md mb-8'>
            <CardHeader className='flex gap-3'>
              <div className='flex flex-col'>
                <p className='text-md'>Selected Game</p>
                <p className='text-xl font-bold'>{selectedGame.name}</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <p>BoardGameGeek ID: {selectedGame.id}</p>
              {selectedGame.yearPublished && (
                <p>Published in {selectedGame.yearPublished}</p>
              )}
              <div className='flex justify-end mt-4'>
                <Button
                  color='primary'
                  size='sm'
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
                  className='ml-2'
                  color='danger'
                  size='sm'
                  variant='light'
                  onClick={clearSelection}
                >
                  Clear
                </Button>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </main>
  );
}
