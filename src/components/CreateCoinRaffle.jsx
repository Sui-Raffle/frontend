import React, { useState } from 'react';

export default function CreateCoinRaffle() {
  // prizeBlance Handeler
  const [prizeBalance, setPrizeBalance] = useState('');
  const handlePrizeBalanceChange = (event) => {
    setPrizeBalance(event.target.value);
  };
  // winnerCount Handeler
  const [winnerCount, setWinnerCount] = useState('');
  const handleWinnerCountChange = (event) => {
    setWinnerCount(event.target.value);
  };

  return (
    <div>
      <div className='flex'>
        <div className='w-1/2'>
          <div class='border-gray-light2 bg-white text-black relative my-2 flex items-center rounded-lg border px-2 py-1'>
            <label className='w-full '>How Many Winners?</label>
            <input
              type='number'
              class='placeholder-gray-light2 block w-full rounded-lg border-transparent bg-transparent '
              placeholder='1'
              value={winnerCount}
              onChange={handleWinnerCountChange}
            />
          </div>
          <div class='border-gray-light2 bg-white text-black relative my-2 flex items-center rounded-lg border px-2 py-1'>
            <label className='w-full '>Prize</label>
            <input
              type='number'
              class='placeholder-gray-light2 block w-full rounded-lg border-transparent bg-transparent p-2 pr-32 text-sm focus:outline-none lg:text-lg'
              placeholder='0'
              onChange={handlePrizeBalanceChange}
              value={prizeBalance}
            />
            <div class='w-38 absolute inset-y-0 right-0 flex items-center rounded-lg'>
              {/* <button
            class='bg-gray-light3 text-primary-default m-2 rounded-lg px-2 py-1'
            // style='visibility: visible;'
          >
            Max
          </button> */}
              <button
                id='dropdownDefaultButton'
                data-dropdown-toggle='dropdown'
                class='inline-flex items-center px-5 py-2.5 text-center text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'
                type='button'
              >
                Coin Type
                <svg
                  class='ml-2.5 h-2.5 w-2.5'
                  aria-hidden='true'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 10 6'
                >
                  <path
                    stroke='currentColor'
                    stroke-linecap='round'
                    stroke-linejoin='round'
                    stroke-width='2'
                    d='m1 1 4 4 4-4'
                  />
                </svg>
              </button>
              <div
                id='dropdown'
                class='z-10 hidden w-32 divide-gray-100 rounded-lg bg-white shadow dark:bg-gray-700'
              >
                <ul
                  class='py-2 text-sm text-gray-700 dark:text-gray-200'
                  aria-labelledby='dropdownDefaultButton'
                >
                  <li>
                    <button class='block w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white'>
                      Type A
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className='w-1/2'>
          <p></p>
        </div>
      </div>
      <button class='w-full bg-blue-500 hover:bg-blue-700 rounded-lg px-4 py-1 text-white'>
        Start Raffle
      </button>
    </div>
  );
}
