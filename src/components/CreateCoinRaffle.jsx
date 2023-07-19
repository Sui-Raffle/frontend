import React, { useState } from 'react';
import { useWalletKit } from '@mysten/wallet-kit';
import getSuiProvider from '../lib/getSuiProvider';
import { moveCallCreateCoinRaffle } from '../lib/moveCallCreateCoinRaffle';
import { moveCallSettleCoinRaffle } from '../lib/moveCallSettleCoinRaffle';
import { getRaffleFields } from '../lib/getRaffleFields';
import { CoinMetadatas } from '../lib/config';
import { updateCoinMetadatas } from '@/lib/updateCoinMetadatas';
import RingAnimation from './RingAnimation';
import { sleep } from '../lib/sleep.jsx';

export default function CreateCoinRaffle() {
  let walletKit = useWalletKit();

  const [startRaffleDigest, setStartRaffleDigest] = useState('');
  const [currentRaffleObjId, setCurrentRaffleObjId] = useState('');
  const [currentRaffleFields, setCurrentRaffleFields] = useState({});
  const [txRunning, setTxRunning] = useState(false);
  const [userCoinsList, setUserCoinsList] = useState([]);
  const [gettedUserCoinsList, setGettedUserCoinsList] = useState(false);
  const [coinMetadataReady, setCoinMetadataReady] = useState(false);
  const [currentCoinInfo, setCurrentCoinInfo] = useState({
    iconUrl: null,
    coinType: '0x2::sui::SUI',
    name: 'Sui',
    symbol: 'SUI',
  });

  // TODO: ray:
  if (!gettedUserCoinsList && walletKit && walletKit.currentAccount) {
    let run = async () => {
      setGettedUserCoinsList(true);
      window.walletKit = walletKit;

      let network = walletKit.currentAccount.chains[0].split('sui:')[1];
      let provider = getSuiProvider(network);
      let userCoins = [];
      let nextCursor = '';
      let res;
      do {
        res = await provider.getAllCoins({
          owner: walletKit.currentAccount.address,
          nextCursor,
        });
        userCoins = userCoins.concat(res.data);
        nextCursor = res.nextCursor;
      } while (res.hasNextPage);
      let coinSum = {};
      userCoins.forEach((coin) => {
        if (coinSum[coin.coinType]) {
          coinSum[coin.coinType].balance += Number(coin.balance);
        } else {
          coinSum[coin.coinType] = {
            type: coin.coinType,
            balance: Number(coin.balance),
          };
        }
      });
      setUserCoinsList(Array.from(Object.values(coinSum)));
      await updateCoinMetadatas(Array.from(Object.keys(coinSum)), walletKit);
      setCoinMetadataReady(true);

      // todo: may have next cursor
    };
    run();
  }

  // TODO: ray: 需要 getRaffleFields 只發生一次就夠了，但要等 walletKit Ready，且 currentRaffleObjId 有值，且 currentRaffleFields 為空
  const [gettingRaffleFieldsById, setGettingRaffleFieldsById] = useState(false);
  if (
    currentRaffleObjId &&
    !gettingRaffleFieldsById &&
    !currentRaffleFields.id &&
    walletKit &&
    walletKit.currentAccount
  ) {
    let run = async () => {
      setGettingRaffleFieldsById(true);
      console.log('run:');
      let raffleFields = await getRaffleFields({
        walletKit,
        raffleObjId: currentRaffleObjId,
      });
      setCurrentRaffleFields(raffleFields);
      console.log('raffleFields:', raffleFields);
      setRaffleName(raffleFields.name);
      setWinnerCount(raffleFields.winner_count);
      await updateCoinMetadatas([raffleFields.coin_type], walletKit);
      setPrizeBalance(
        raffleFields.balance /
          10 ** CoinMetadatas[raffleFields.coin_type].decimals
      ); //
      setAddresses(
        raffleFields.participants.join('\n') + raffleFields.winners.join('\n')
      );
      setGettingRaffleFieldsById(false);
    };
    run();
  }
  // TODO: ray: 需要 getTransactionBlock 只發生一次就夠了，但要等 walletKit Ready 且 startRaffleDigest 有值且 currentRaffleObjId 為空
  const [gettingRaffleIdByDigest, setGettingRaffleIdByDigest] = useState(false);
  if (
    startRaffleDigest &&
    !gettingRaffleIdByDigest &&
    !currentRaffleObjId &&
    walletKit &&
    walletKit.currentAccount
  ) {
    setGettingRaffleIdByDigest(true);
    let run = async () => {
      try {
        let network = walletKit.currentAccount.chains[0].split('sui:')[1];
        let provider = getSuiProvider(network);
        // console.log('walletKit:', walletKit);
        console.log(
          'let transactionBlock = await provider.getTransactionBlock({'
        );
        let transactionBlock = await provider.getTransactionBlock({
          digest: startRaffleDigest,
          options: { showObjectChanges: true },
        });
        setTxRunning(false);
        let raffleObjId = transactionBlock.objectChanges.filter((obj) => {
          return obj.type == 'created';
        })[0].objectId;
        setCurrentRaffleObjId(raffleObjId);
      } catch (e) {
        console.log('ERROR:', e);
        await sleep(1000);
        run();
      }
      setGettingRaffleIdByDigest(false);
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
    setTxRunning(true);
    let result = await moveCallSettleCoinRaffle({
      walletKit,
      raffleObjId: currentRaffleObjId,
    });
    setTxRunning(false);
    if (result) {
      setCurrentRaffleFields({});
    } else {
      alert(
        'This raffle is not ready yet. Please wait a few seconds and try again.'
      );
    }
  };
  const handleStartRaffle = async (event) => {
    let _winnerCount = Number(winnerCount) || 1;
    let _prizeBalance = prizeBalance || prizeBalanceDefault;
    let _addresses = addresses.split('\n');
    let coin_type = currentCoinInfo.coinType;
    setTxRunning(true);
    console.log({
      walletKit,
      addresses: _addresses,
      raffleName,
      winnerCount: _winnerCount,
      prizeBalance,
      coin_type,
    });

    let resData = await moveCallCreateCoinRaffle({
      walletKit,
      addresses: _addresses,
      raffleName,
      winnerCount: _winnerCount,
      prizeBalance,
      coin_type,
    });
    console.log('resData:', resData);

    let network = walletKit.currentAccount.chains[0].split('sui:')[1];
    let provider = getSuiProvider(network);

    setStartRaffleDigest(resData.digest);
  };

  return (
    <div className='mx-auto max-w-full bg-gray-800 p-6 shadow'>
      <div className='flex'>
        <div className='w-1/2'>
          <div className='border-gray-light2 bg-white text-black relative my-2 flex items-center rounded-lg border px-2 py-1'>
            <label className='w-full '>Raffle Name</label>
            <input
              type='text'
              className='placeholder-gray-light2 block w-full rounded-lg border-transparent bg-transparent '
              placeholder='Name of your Raffle'
              value={raffleName}
              onChange={handleRaffleNameChange}
              disabled={currentRaffleObjId}
            />
          </div>
          <div className='border-gray-light2 bg-white text-black relative my-2 flex items-center rounded-lg border px-2 py-1'>
            <label className='w-full '>How Many Winners?</label>
            <input
              type='number'
              className='placeholder-gray-light2 block w-full rounded-lg border-transparent bg-transparent '
              placeholder='1'
              value={winnerCount}
              onChange={handleWinnerCountChange}
              disabled={currentRaffleObjId}
            />
          </div>
          <div className='border-gray-light2 bg-white text-black relative my-2 flex items-center rounded-lg border px-2 py-1'>
            <label className='w-48'>Prize Amount</label>
            <input
              type='number'
              className='placeholder-gray-light2 block w-full rounded-lg border-transparent bg-transparent p-2 pr-32 text-sm focus:outline-none lg:text-lg mx-3'
              placeholder='0'
              onChange={handlePrizeBalanceChange}
              value={prizeBalance}
              disabled={currentRaffleObjId}
            />
            <div className='w-38 absolute inset-y-0 right-0 flex items-center rounded-lg'>
              {/* <button
            className='bg-gray-light3 text-primary-default m-2 rounded-lg px-2 py-1'
            // style='visibility: visible;'
          >
            Max
          </button> */}
              <button
                id='coinSelectDropdownButton'
                data-dropdown-toggle='coinSelectDropdown'
                className='inline-flex items-center px-5 py-2.5 text-center text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'
                type='button'
                disabled={currentRaffleObjId}
              >
                {CoinMetadatas[currentCoinInfo.coinType] &&
                  CoinMetadatas[currentCoinInfo.coinType].iconUrl && (
                    <img
                      className='inline-block h-6 w-6 mx-1'
                      src={CoinMetadatas[currentCoinInfo.coinType].iconUrl}
                    />
                  )}
                {currentCoinInfo.name || currentCoinInfo.symbol}
                <svg
                  className='ml-2.5 h-2.5 w-2.5'
                  aria-hidden='true'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 10 6'
                >
                  <path
                    stroke='currentColor'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='m1 1 4 4 4-4'
                  />
                </svg>
              </button>
              <div
                id='coinSelectDropdown'
                className='z-10 hidden w-64 divide-gray-100 rounded-lg bg-white shadow dark:bg-gray-700'
              >
                <ul
                  className='py-2 text-sm text-gray-700 dark:text-gray-200'
                  aria-labelledby='coinSelectDropdownButton'
                >
                  {userCoinsList.map((coin, index) => {
                    if (coinMetadataReady && CoinMetadatas[coin.type]) {
                      let icon = () => {
                        if (CoinMetadatas[coin.type].iconUrl) {
                          return (
                            <img
                              className='inline-block h-6 w-6 mx-1'
                              src={CoinMetadatas[coin.type].iconUrl}
                            />
                          );
                        } else {
                          return <></>;
                        }
                      };
                      let handleOnClick = () => {
                        setCurrentCoinInfo({
                          coinType: coin.type,
                          ...CoinMetadatas[coin.type],
                        });
                        let a = document
                          .getElementById('coinSelectDropdownButton')
                          .click();
                      };
                      return (
                        <li key={index}>
                          <button
                            className='block w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white'
                            onClick={handleOnClick}
                          >
                            {icon()}
                            {(
                              coin.balance /
                              10 ** CoinMetadatas[coin.type].decimals
                            ).toFixed(2)}{' '}
                            {CoinMetadatas[coin.type].name ||
                              CoinMetadatas[coin.type].symbol}{' '}
                          </button>
                        </li>
                      );
                    } else {
                      return <></>;
                    }
                  })}
                  <li>
                    <button className='block w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white'>
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
            <p className='text-white'>Participant Addresses</p>
            <textarea
              className='w-full h-3/4 rounded p-2 overflow-x-auto'
              value={addresses}
              onChange={handleAddressesChange}
            ></textarea>
          </div>
        </div>
      </div>
      <div>{}</div>
      {(txRunning && (
        <div className='w-full text-center'>
          <RingAnimation></RingAnimation>
        </div>
      )) ||
        (currentRaffleFields.winners && currentRaffleFields.winners.length && (
          <div>
            <div className='w-full rounded bg-white px-4 py-2 text-center mb-3'>
              <p>🎊 Winners 🎊</p>
              {currentRaffleFields.winners.map((address, index) => (
                <p key={index}>{address}</p>
              ))}
            </div>
            <button
              className='w-full bg-green-500 hover:bg-green-700 rounded-lg px-4 py-1 text-white'
              onClick={window.location.reload()}
            >
              Create Another Raffle
            </button>
          </div>
        )) ||
        (!currentRaffleObjId && (
          <button
            className='w-full bg-blue-500 hover:bg-blue-700 rounded-lg px-4 py-1 text-white'
            onClick={handleStartRaffle}
            disabled={!winnerCount || !addresses}
          >
            Start Raffle
          </button>
        )) || (
          <button
            className='w-full bg-green-500 hover:bg-green-700 rounded-lg px-4 py-1 text-white'
            onClick={handleSettleRaffle}
          >
            Settle Raffle
          </button>
        )}
      {}
    </div>
  );
}
