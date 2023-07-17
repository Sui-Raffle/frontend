import React, { useState } from 'react';
import { useWalletKit } from '@mysten/wallet-kit';
import { TransactionBlock } from '@mysten/sui.js';
import getSuiProvider from '../lib/getSuiProvider';

let createRaffle = async ({
  walletKit,
  addresses,
  raffleName,
  winnerCount,
  prizeBalance,
  coin_type,
}) => {
  if (walletKit.currentAccount) {
    let drand = await fetch(
      `https://drand.cloudflare.com/8990e7a9aaed2ffed73dbd7092123d6f289930540d7651336225dc172e51b2ce/public/latest`
    ).then((response) => response.json());
    let round = drand.round + 2;
    const tx = new TransactionBlock();
    let coinInput = undefined;
    if (coin_type === '0x2::sui::SUI') {
      coinInput = tx.splitCoins(tx.gas, [
        tx.pure(prizeBalance * 10 ** 9, 'u64'),
      ]);
    } else {
      // const [mainCoin, ...otherCoins] = coins
      //   .filter((coin) => coin.coinType === coin_type)
      //   .map((coin) =>
      //     tx.objectRef({
      //       objectId: coin.coinObjectId,
      //       digest: coin.digest,
      //       version: coin.version,
      //     })
      //   );
      // if (mainCoin) {
      //   if (otherCoins.length > 0) {
      //     tx.mergeCoins(mainCoin, otherCoins);
      //     coinInput = tx.splitCoins(mainCoin, [
      //       tx.pure(
      //         collateralAmount *
      //           10 ** (ASSET_DECIAMLS[coinSymbol as ACCEPT_ASSETS] ?? 9),
      //         "u64"
      //       ),
      //     ]);
      //   } else {
      //     coinInput = tx.splitCoins(mainCoin, [
      //       tx.pure(
      //         collateralAmount *
      //           10 ** (ASSET_DECIAMLS[coinSymbol as ACCEPT_ASSETS] ?? 9),
      //         "u64"
      //       ),
      //     ]);
      //   }
    }
    console.log('coinInput:', coinInput);

    tx.moveCall({
      target:
        '0xc5c1c1d7c860399cf7e46c6513e13bca5c7935f382862c2e886fd280a4032012::raffle::create_raffle',
      typeArguments: [coin_type],
      arguments: [
        tx.pure(Array.from(new TextEncoder().encode(raffleName)), 'vector<u8>'),
        tx.pure(round, 'u64'),
        tx.pure(addresses, 'vector<address>'),
        tx.pure(parseInt(winnerCount), 'u64'),
        coinInput,
      ],
    });

    const resData = await walletKit.signAndExecuteTransactionBlock({
      transactionBlock: tx,
    });
    console.log('resData', resData);

    return resData;
  }
};
export default function CreateCoinRaffle() {
  let walletKit = useWalletKit();

  const [startRaffleDigest, setStartRaffleDigest] = useState(
    '13MMYqAJnoUgtdF2uo29YyS95WpgZAN9rDUGLAD7F9ZS'
  );
  const [currentRaffleObjId, setCurrentRaffleObjId] = useState('');

  if (
    !currentRaffleObjId &&
    startRaffleDigest &&
    walletKit &&
    walletKit.currentAccount
  ) {
    let run = async () => {
      let network = walletKit.currentAccount.chains[0].split('sui:')[1];
      let provider = getSuiProvider(network);
      console.log('provider:', provider);
      console.log('startRaffleDigest:', startRaffleDigest);

      let transactionBlock = await provider.getTransactionBlock({
        digest: startRaffleDigest,
        options: { showObjectChanges: true },
      });
      let raffleObjId = transactionBlock.objectChanges.filter((obj) => {
        return obj.type == 'created';
      })[0].objectId;
      setCurrentRaffleObjId(raffleObjId);
    };
    run();
  }
  // raffle name Handeler
  let raffleNameDefault = '';
  const [raffleName, setRaffleName] = useState(raffleNameDefault);
  const handleRaffleNameChange = (event) => {
    setRaffleName(event.target.value);
  };
  // prizeBlance Handeler
  let prizeBalanceDefault = 0;
  const [prizeBalance, setPrizeBalance] = useState(prizeBalanceDefault);
  const handlePrizeBalanceChange = (event) => {
    setPrizeBalance(event.target.value);
  };
  // winnerCount Handeler
  let winnerCountDefault = 1;
  const [winnerCount, setWinnerCount] = useState(winnerCountDefault);
  const handleWinnerCountChange = (event) => {
    setWinnerCount(event.target.value);
  };
  // addresses Handeler
  const [addresses, setAddresses] = useState(
    '0x3d1037246147d652b463ff8815acaf034091d21bf2cfa996fab41d36c96ba099\n0x04d626ce8938318165fab01491095329aee67fd017a4a17fe2c981b8a9a569cc\n0x388a0e160cb67dbac3a182f1fadd31612a78fc271916db4b2f7d99d2c9ca2c72'
  );
  const handleAddressesChange = (event) => {
    setAddresses(event.target.value);
  };
  const handleSettleRaffle = async (event) => {
    '';
  };
  const handleStartRaffle = async (event) => {
    let _winnerCount = Number(winnerCount) || 1;
    let _prizeBalance = prizeBalance || prizeBalanceDefault;
    let _addresses = addresses.split('\n');
    console.log('walletKit.currentAccount:', walletKit.currentAccount);
    console.log('addresses:', _addresses);
    console.log('prizeBalance:', _prizeBalance);
    console.log('winnerCount:', _winnerCount);
    let coin_type = '0x2::sui::SUI';
    let resData = await createRaffle({
      walletKit,
      addresses: _addresses,
      raffleName,
      winnerCount: _winnerCount,
      prizeBalance,
      coin_type,
    });
    setStartRaffleDigest(resData.digest);
  };

  return (
    <div>
      <div className='flex'>
        <div className='w-1/2'>
          <div class='border-gray-light2 bg-white text-black relative my-2 flex items-center rounded-lg border px-2 py-1'>
            <label className='w-full '>Raffle Name</label>
            <input
              type='text'
              class='placeholder-gray-light2 block w-full rounded-lg border-transparent bg-transparent '
              placeholder='Name of your Raffle'
              value={raffleName}
              onChange={handleRaffleNameChange}
              disabled={currentRaffleObjId}
            />
          </div>
          <div class='border-gray-light2 bg-white text-black relative my-2 flex items-center rounded-lg border px-2 py-1'>
            <label className='w-full '>How Many Winners?</label>
            <input
              type='number'
              class='placeholder-gray-light2 block w-full rounded-lg border-transparent bg-transparent '
              placeholder='1'
              value={winnerCount}
              onChange={handleWinnerCountChange}
              disabled={currentRaffleObjId}
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
              disabled={currentRaffleObjId}
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
                Sui
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
          <div className='ml-2 my-2 h-full'>
            <textarea
              class='w-full h-3/4 rounded p-2 overflow-x-auto'
              value={addresses}
              onChange={handleAddressesChange}
            ></textarea>
          </div>
        </div>
      </div>

      {(!currentRaffleObjId && (
        <button
          class='w-full bg-blue-500 hover:bg-blue-700 rounded-lg px-4 py-1 text-white'
          onClick={handleStartRaffle}
        >
          Start Raffle
        </button>
      )) || (
        <button
          class='w-full bg-green-500 hover:bg-green-700 rounded-lg px-4 py-1 text-white'
          onClick={handleSettleRaffle}
        >
          Settle Raffle
        </button>
      )}
    </div>
  );
}
