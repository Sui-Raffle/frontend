import { WalletKitProvider } from '@mysten/wallet-kit';
import * as React from 'react';

import Layout from '@/components/layout/Layout';
import Seo from '@/components/Seo';

import Navbar from '../components/Navbar';

import CreateCoinRaffle from '../components/CreateCoinRaffle';

import { PreviousCoinRaffles } from '../components/PreviousCoinRaffles';
import Script from 'next/script';
import 'flowbite';
import Link from 'next/link';
/**
 * SVGR Support
 * Caveat: No React Props Type.
 *
 * You can override the next-env if the type is important to you
 * @see https://stackoverflow.com/questions/68103844/how-to-override-next-js-svg-module-declaration
 */

// !STARTERCONF -> Select !STARTERCONF and CMD + SHIFT + F
// Before you begin editing, follow all comments with `STARTERCONF`,
// to customize the default configuration.

export default function HomePage() {
  return (
    <WalletKitProvider>
      <Layout>
        {/* <Seo templateTitle='Home' /> */}
        <Seo />
        <main>
          <Navbar></Navbar>
          <section>
            <CreateCoinRaffle></CreateCoinRaffle>
            <PreviousCoinRaffles></PreviousCoinRaffles>
          </section>
          {/* <section>
            <div className='mt-3 width-full text-center'>
              <h1>Welcome to Bucket Raffle System</h1>
              <hr className='my-4'></hr>
              <Link
                href={`/coinRaffle`}
                className='h2 bg-blue-500 hover:bg-blue-700 rounded-lg px-4 py-1 text-white'
              >
                Go To Coin Raffle
              </Link>
            </div>
          </section> */}
        </main>
      </Layout>
    </WalletKitProvider>
  );
}
