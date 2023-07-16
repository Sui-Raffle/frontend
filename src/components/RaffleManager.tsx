import * as React from 'react';

import CreateRaffle from '@/components/CreateRaffle';
import SettleRaffle from '@/components/SettleRaffle';

export function RaffleManager() {
  return (
    <div className='mx-auto max-w-full bg-gray-800 p-6 shadow'>
      <CreateRaffle></CreateRaffle>
      {/* <SettleRaffle></SettleRaffle> */}
    </div>
  );
}
