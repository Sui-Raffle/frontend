import { ConnectToWallet } from './ConnectToWallet';
export default function Navbar() {
  return (
    <nav className='bg-black'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='flex h-16 items-center justify-between'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <img
                className='h-8 w-8'
                src='https://pbs.twimg.com/profile_images/1648858372475883521/uYQC9VhE_400x400.jpg'
                alt='Logo'
              />
            </div>
            <div className='hidden md:block'>
              <div className='ml-10 flex items-baseline space-x-4'>
                <a
                  href='#'
                  className='rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white'
                >
                  About Bucket
                </a>
                <a
                  href='#'
                  className='rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white'
                >
                  Raffle
                </a>
                <a
                  href='#'
                  className='rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white'
                >
                  How it work?
                </a>
                <a
                  href='#'
                  className='rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white'
                >
                  Contact
                </a>
              </div>
            </div>
          </div>
          <div className='hidden md:block'>
            <div className='ml-4 flex items-center md:ml-6'>
              <ConnectToWallet></ConnectToWallet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
