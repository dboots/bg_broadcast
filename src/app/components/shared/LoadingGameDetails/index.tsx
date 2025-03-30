// src/app/components/shared/LoadingGameDetails.tsx
import React from 'react';
import { Spinner } from '@nextui-org/react';

interface LoadingGameDetailsProps {
  error?: string | null;
}

const LoadingGameDetails: React.FC<LoadingGameDetailsProps> = ({ error }) => {
  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h2 className='text-2xl font-bold mb-4'>Game Details</h2>
        <div className="flex flex-col items-center justify-center p-4">
          <div className="text-red-500 text-center">
            <p className="font-semibold">Error loading game details</p>
            <p className="text-sm mt-2">{error}</p>
            <p className="text-sm mt-4 text-gray-500">
              Unable to fetch game information from BoardGameGeek at this time.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
      <h2 className='text-2xl font-bold mb-4'>Game Details</h2>
      <div className="flex flex-col items-center justify-center p-10">
        <Spinner size="lg" color="primary" />
        <p className="mt-4 text-gray-500">Loading game details from BoardGameGeek...</p>
      </div>
    </div>
  );
};

export default LoadingGameDetails;