import Link from 'next/link';
import { ConnectToWallet } from './ConnectToWallet';
import NextImage from '@/components/NextImage';
export default function Navbar() {
  // TODO: ray: Navbar 在手機版的支援度還有排版，想請你協助
  // TODO: ray: 想請你弄個 Bucket Raffle System 的 Logo
  return (
    <nav className='bg-black'>
      <div className='mx-auto w-[90%]'>
        <div className='flex h-16 items-center justify-between'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <NextImage
                useSkeleton
                className='w-32 md:w-40'
                src='/images/bucket_logo_with_text.png'
                width='180'
                height='180'
                alt='Icon'
              />
            </div>
            <div className='hidden md:block'>
              <div className='ml-10 flex items-baseline space-x-4'>
                <Link
                  className='rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white'
                  href='/'
                >
                  Home
                </Link>
                <Link
                  className='rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white'
                  href='/coinRaffle'
                >
                  Coin Raffle
                </Link>
                <Link
                  className='rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white'
                  href='/nftRaffle'
                >
                  NFT Raffle
                </Link>
                <a
                  href='https://bucketprotocol.io'
                  target='_blank'
                  className='rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white'
                >
                  About Bucket
                </a>

                <button
                  href='https://github.com/Bucket-Protocol/Bucket-Raffle-System'
                  target='_blank'
                  className='rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white'
                >
                  How it work?
                </button>
                <a
                  href='https://github.com/Bucket-Protocol/Bucket-Raffle-System'
                  target='_blank'
                  className='rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white'
                >
                  GitHub
                </a>
              </div>
            </div>
          </div>
          <div className='md:block'>
            <div className='flex items-center md:ml-6'>
              <ConnectToWallet></ConnectToWallet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
