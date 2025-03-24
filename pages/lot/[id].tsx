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
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CiHeart, CiStopwatch } from 'react-icons/ci';

const service = new ListingService();
const auctionService = new AuctionService();

export const getServerSideProps: GetServerSideProps<{
  auction: Auction | undefined;
  initialListings: Listing[];
}> = async (context) => {
  const auction = await auctionService.single<Auction>(
    'auctions',
    context.query.id as string
  );

  const listings = await service.read<Listing>('listings', {
    name: 'auctions',
    field: 'auctionRef',
    id: auction?.id as string,
  });

  return { props: { auction, initialListings: listings } };
};

export default function Page({
  auction,
  initialListings,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [listings, updateListings] = useState<Listing[]>([]);
  const [profile, updateProfile] = useState<Profile>();
  let dateEnd: Date = new Date(auction?.endDate as string);
  const userService = new UserService();
  const user = useAuth();

  const bid = async (listing: Listing, amount: number) => {
    // TODO: Implement bid functionality
    const updated = await service.bid('123', listing, amount);
    const index = listings.findIndex((l) => l.id === listing.id);
    listings[index] = updated;
    updateListings([...listings]);
  };

  const save = async (listing: Listing) => {
    console.log('saving profile', profile);
    if (!profile) {
      console.log('creating new profile');
      let profile = await userService.create({
        uid: user?.uid as string,
        saved: [listing.id],
      });

      updateProfile(profile);
    } else {
      if (profile.saved) {
        console.log('pushing', listing.id);
        if (profile.saved.indexOf(listing.id) === -1) {
          profile.saved.push(listing.id);
        } else {
          const idx = profile.saved.indexOf(listing.id);
          profile.saved.splice(idx, 1);
        }
      } else {
        profile.saved = [listing.id];
      }

      console.log('profile saved', profile);
      updateProfile({
        ...profile,
        saved: profile.saved,
      });
      await userService.update(
        {
          saved: profile.saved,
        },
        profile.id as string
      );
    }
  };

  useEffect(() => {
    updateListings(initialListings);
  }, []);

  useEffect(() => {
    if (user) {
      const initProfile = async () => {
        updateProfile(await userService.single<Profile>(user.uid));
      };

      initProfile();
    }
  }, [user]);

  const getHighestBid = (bids: Bid[]) => {
    if (bids.length === 0) {
      return 0; // Return 0 if there are no bids
    }

    return bids.reduce((highestBid, currentBid) => {
      return currentBid.amount > highestBid.amount ? currentBid : highestBid;
    }, bids[0]).amount;
  };

  const getBidAmount = (listing: Listing): number => {
    const currentBid: number = getHighestBid(listing.bids);

    for (const range of auction?.increments || []) {
      if (currentBid >= range.start && currentBid < range.end) {
        return range.increment + currentBid;
      }
    }

    return currentBid + 10;
  };

  const isListingExpired = (listing: Listing): boolean => {
    const listingDate = listing.endDate ? listing.endDate : auction?.endDate;

    const d = new Date(listingDate?.toString() as string);
    return d.getTime() > new Date().getTime();
  };

  return (
    <>
      <Head>
        <title>{auction?.description}</title>
      </Head>
      <div className='container m-auto'>
        <div className='font-bold text-2xl my-4'>{auction?.description}</div>
        <div className='grid md:grid-cols-2 lg:grid-cols-4 md:gap-2 lg:gap-4'>
          {listings.map((listing, idx) => {
            return (
              <div key={idx} className='flex flex-col'>
                <div>
                  <Link key={listing.id} href={`/listing/${listing.id}`}>
                    {listing.images.length ? (
                      <img
                        style={{ height: 250 }}
                        className='rounded-lg shadow-lg'
                        src={listing.images[0]}
                      />
                    ) : (
                      <img
                        alt='Placeholder Image'
                        className='rounded-lg shadow-lg'
                        src='https://fpoimg.com/300x250'
                      />
                    )}
                  </Link>
                </div>
                <div className='font-bold text-2xl'>
                  <Link key={listing.id} href={`/listing/${listing.id}`}>
                    {listing.title}
                  </Link>
                </div>
                <div>
                  <CountdownTimer targetTime={dateEnd.toISOString()} />
                </div>
                <div>Bids: {listing.bids.length}</div>
                <div className='flex align-center'>
                  {user && isListingExpired(listing) ? (
                    <>
                      <Button
                        color='success'
                        variant='solid'
                        onClick={() => {
                          bid(listing, getBidAmount(listing));
                        }}
                      >
                        Bid ${getBidAmount(listing)}
                      </Button>
                      <Button
                        color='danger'
                        variant={
                          profile?.saved?.indexOf(listing.id) === -1
                            ? 'solid'
                            : 'bordered'
                        }
                        onClick={() => {
                          save(listing);
                        }}
                        startContent={<CiStopwatch />}
                      >
                        {profile?.saved?.indexOf(listing.id) === -1
                          ? 'Watch'
                          : 'Watched'}
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
