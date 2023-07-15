import * as React from 'react';

import CreateRaffle from '@/components/CreateRaffle';
import SettleRaffle from '@/components/SettleRaffle';

export function RaffleManager() {
  return (
    <div className='mx-auto max-w-full border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800'>
      <CreateRaffle></CreateRaffle>
      {/* <SettleRaffle></SettleRaffle> */}
    </div>
  );
}
