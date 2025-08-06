import type { AppProps } from 'next/app';
import Head from 'next/head';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Weather Dashboard - Interactive Weather Data Visualization</title>
        <meta name="description" content="Interactive weather dashboard with timeline and spatial analysis capabilities" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="keywords" content="weather, dashboard, visualization, react, nextjs" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}