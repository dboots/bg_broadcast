import Listings from '@/app/components/Listings/Listings';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';

export const getServerSideProps: GetServerSideProps<{}> = async () => {
  return { props: {} };
};

export default function Page({}: InferGetServerSidePropsType<
  typeof getServerSideProps
>) {
  return (
    <main className='max-w-screen-xl min-h-screen mx-auto'>
      <div className='flex flex-col items-center justify-center ps-4 my-4'>

      </div>
    </main>
  );
}
