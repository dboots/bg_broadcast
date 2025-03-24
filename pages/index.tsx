import Listings from '@/app/components/Listings/Listings';
import Auction from '@/models/auction.model';
import { AuctionService } from '@/services/auction.service';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';

export const getServerSideProps: GetServerSideProps<{
  auctions: Auction[];
}> = async () => {
  const service = new AuctionService();
  const auctions = await service.read<Auction>('auctions');
  return { props: { auctions } };
};

export default function Page({
  auctions,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <main className='max-w-screen-xl min-h-screen mx-auto'>
      <div className='flex flex-col items-center justify-center ps-4 my-4'>
        {
          // This really should be <Lots /></Lots> or <Auctions></Auctions>
        }
        <Listings auctions={auctions} />
      </div>
    </main>
  );
}
