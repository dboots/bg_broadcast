import { AppProps } from 'next/app';
import { Layout } from '../ui/layouts/main';
import { NextUIProvider } from '@nextui-org/react';

import '../src/app/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <NextUIProvider>
      <main>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </main>
    </NextUIProvider>
  );
}
