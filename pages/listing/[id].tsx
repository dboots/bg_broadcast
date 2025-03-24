import CountdownTimer from '@/app/components/shared/CountdownTimer/CountdownTimer';
import useAuth from '@/hooks/useAuth';
import Auction from '@/models/auction.model';
import { Bid, Listing } from '@/models/listing.model';
import { Profile } from '@/models/profile.model';
import { AuctionService } from '@/services/auction.service';
import { ListingService } from '@/services/listing.service';
import { UserService } from '@/services/user.service';
import { Button } from '@nextui-org/react';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { CiHeart, CiStopwatch } from 'react-icons/ci';

const service = new ListingService();

export const getServerSideProps: GetServerSideProps<{
  listing: Listing | undefined;
}> = async (context) => {
  const listing = await service.single<Listing>(
    'listings',
    context.query.id as string
  );

  console.log('listing', listing);

  return { props: { listing } };
};

export default function Page({
  listing,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [profile, updateProfile] = useState<Profile>();
  const userService = new UserService();
  const user = useAuth();

  useEffect(() => {
    if (user) {
      const initProfile = async () => {
        updateProfile(await userService.single<Profile>(user.uid));
      };

      initProfile();
    }
  }, [user]);

  return (
    <>
      <Head>
        <title>{listing?.title}</title>
      </Head>
      <div className='container m-auto'>
        <div className='font-bold text-2xl my-4'>{listing?.title}</div>
        <div className='font-bold text-l my-4'>{listing?.description}</div>
        <div className='grid md:grid-cols-2 lg:grid-cols-4 md:gap-2 lg:gap-4'>
          {listing?.images.map((image) => (
            <img
              key={image}
              style={{ height: 250 }}
              className='rounded-lg shadow-lg'
              src={image}
            />
          ))}
        </div>
      </div>
    </>
  );
}
