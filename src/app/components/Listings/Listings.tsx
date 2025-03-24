import Auction from '@/models/auction.model';
import Link from 'next/link';

interface ListingsProps {
  auctions: Auction[];
}

const Listings: React.FC<ListingsProps> = ({ auctions }) => {
  return (
    <div className='grid md:grid-cols-3 lg:grid-cols-4 md:gap-3 lg:gap-4'>
      {auctions.map((auction) => {
        return (
          <div key={auction.id}>
            <Link href={`/lot/${auction.id}`}>
              <div
                key={auction.id}
                className='rounded-lg shadow-lg'
                style={{ width: '250px' }}
              >
                <img
                  className='rounded-t-lg'
                  src='http://fpoimg.com/300x250?text=Preview'
                />
                <div className='p-4'>
                  {auction.description}
                  <div>{auction.listings?.length} listings</div>
                  <div>
                    {auction.listings?.reduce(
                      (acc, listing) =>
                        (listing.images ? listing.images.length : 0) + acc,
                      0
                    )}{' '}
                    images
                  </div>
                </div>
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default Listings;
