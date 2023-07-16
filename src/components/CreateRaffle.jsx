import React, { useState } from 'react';
import CreateCoinRaffle from './CreateCoinRaffle';
import CreateNFTRaffle from './CreateNFTRaffle';

export default function CreateRaffle() {
  const [raffleType, setRaffleType] = useState('Coin');
  return (
    <div>
      <div className='mt-5 '>
        <div className='flex justify-between text-white'>
          <div className='w-1/2'>
            <div className='flex'>
              <p className='mr-2'>Mode: </p>
              <div class='flex-4 mr-3 items-center'>
                <input
                  id='coin_radio-1'
                  type='radio'
                  value='Coin'
                  name='mode_radio'
                  class='h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600'
                  checked={raffleType === 'Coin'}
                  onChange={() => setRaffleType('Coin')}
                />
                <label
                  for='coin_radio-1'
                  class='ml-2 text-sm font-medium text-white'
                >
                  <span
                    className={
                      raffleType === 'Coin' ? 'text-white' : 'text-gray-400'
                    }
                  >
                    Coin
                  </span>
                </label>
              </div>
              <div class='flex-4 mr-3 items-center'>
                <input
                  id='NFT_radio-2'
                  type='radio'
                  value='NFTs'
                  name='mode_radio'
                  class='h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600'
                  checked={raffleType === 'NFTs'}
                  onChange={() => setRaffleType('NFTs')}
                />
                <label for='NFT_radio-2' class='ml-2 text-sm font-medium '>
                  <span
                    className={
                      raffleType === 'NFTs' ? 'text-white' : 'text-gray-400'
                    }
                  >
                    NFT(s)
                  </span>
                </label>
              </div>
            </div>
          </div>
          <div className='w-1/2'>Participants' Addresses</div>
        </div>
        <div>
          {raffleType === 'Coin' && <CreateCoinRaffle />}
          {raffleType === 'NFTs' && <CreateNFTRaffle />}
        </div>
      </div>
    </div>
  );
}
