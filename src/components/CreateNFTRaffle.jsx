import React, { useEffect, useState } from 'react';
import { useWalletKit } from '@mysten/wallet-kit';
import getSuiProvider from '../lib/getSuiProvider';
import { moveCallCreateNFTRaffle } from '../lib/moveCallCreateNFTRaffle';
import { moveCallSettleNFTRaffle } from '../lib/moveCallSettleNFTRaffle';
import { getRaffleFields } from '../lib/getRaffleFields';

import RingAnimation from './RingAnimation';
import { sleep } from '../lib/sleep.jsx';
import { getNetwork, getNetworkIgnoreError } from '../lib/getNetwork';
import { renderNftSelectorModel } from './renderNftSelectorModel';
import { formatImageUrl } from '../lib/formatImageUrl';
export default function CreateCoinRaffle() {
  let walletKit = useWalletKit();

  const [startRaffleDigest, setStartRaffleDigest] = useState('');
  const [currentRaffleObjId, setCurrentRaffleObjId] = useState('');
  const [currentRaffleFields, setCurrentRaffleFields] = useState({});
  const [txRunning, setTxRunning] = useState(false);

  const [prizeNFTs, setPrizeNFTs] = useState([]);

  useEffect(() => {
    let run = async () => {
      if (
        walletKit &&
        walletKit.currentAccount &&
        walletKit.currentAccount.chains
      ) {
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

        // todo: may have next cursor
      }
    };
    run();
  }, [walletKit]);

  useEffect(() => {
    let run = async () => {
      if (
        currentRaffleObjId &&
        !currentRaffleFields.id &&
        walletKit &&
        walletKit.currentAccount
      ) {
        let raffleFields = await getRaffleFields({
          walletKit,
          raffleObjId: currentRaffleObjId,
        });
        setCurrentRaffleFields(raffleFields);
        console.log('raffleFields:', raffleFields);
        setRaffleName(raffleFields.name);
        setAddresses(
          raffleFields.participants.join('\n') + raffleFields.winners.join('\n')
        );
      }
    };
    run();
  }, [walletKit, currentRaffleObjId, currentRaffleFields]);

  useEffect(() => {
    let run = async () => {
      if (
        walletKit &&
        walletKit.currentAccount &&
        walletKit.currentAccount.chains &&
        startRaffleDigest
      ) {
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
      }
    };
    run();
  }, [walletKit, startRaffleDigest]);

  // raffle name Handeler
  let raffleNameDefault = '';
  const [raffleName, setRaffleName] = useState(raffleNameDefault);
  const handleRaffleNameChange = (event) => {
    setRaffleName(event.target.value);
  };
  // addresses Handeler
  const [addresses, setAddresses] = useState(
    '0x3d1037246147d652b463ff8815acaf034091d21bf2cfa996fab41d36c96ba099\n0x04d626ce8938318165fab01491095329aee67fd017a4a17fe2c981b8a9a569cc\n0x388a0e160cb67dbac3a182f1fadd31612a78fc271916db4b2f7d99d2c9ca2c72'
  );
  const handleAddressesChange = (event) => {
    setAddresses(event.target.value);
  };
  // TODO:
  const handleSettleRaffle = async (event) => {
    setTxRunning(true);
    let result = await moveCallSettleNFTRaffle({
      walletKit,
      raffleObjId: currentRaffleObjId,
    });
    setTxRunning(false);
    if (result) {
      let updateRaffleFields = async () => {
        let raffleFields = await getRaffleFields({
          walletKit,
          raffleObjId: currentRaffleObjId,
        });
        setCurrentRaffleFields(raffleFields);
      };
      await updateRaffleFields();
      setTimeout(updateRaffleFields, 1000);
    } else {
      alert(
        'This raffle is not ready yet. Please wait a few seconds and try again.'
      );
    }
  };
  const handleStartRaffle = async (event) => {
    let _addresses = addresses.split('\n');
    if (prizeNFTs.length < 1) {
      alert('Please enter at least one NFT ObjectID');
      return;
    }
    console.log('prizeNFTs:', prizeNFTs);

    let NFT_types = Array.from(new Set(prizeNFTs.map((x) => x.data.type)));
    if (NFT_types.length > 1) {
      alert('You can only raffle on type of NFT at a time.');
      return;
    }
    if (addresses.split('\n').length < 1) {
      ('');
    }
    setTxRunning(true);
    console.log({
      walletKit,
      addresses: _addresses,
      raffleName,
      NFTs: prizeNFTs,
    });

    let resData = await moveCallCreateNFTRaffle({
      walletKit,
      addresses: _addresses,
      raffleName,
      NFTs: prizeNFTs,
    });
    console.log('resData:', resData);

    setStartRaffleDigest(resData.digest);
    setTxRunning(false);
  };

  let handleNftSelectorOnConfirm = (selectedNFTs) => {
    setPrizeNFTs(selectedNFTs);
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

          <div className='border-gray-light2 bg-white text-black relative my-2  items-center rounded-lg border px-2 py-1'>
            <p className='text-center w-full'>
              Prize NFTs ({prizeNFTs.length})
            </p>
            <div
              className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-2'
              style={{ '-ms-overflow-style': 'none' }}
            >
              {prizeNFTs.map((item, index) => {
                return (
                  <div
                    key={index}
                    className={`max-w-sm bg-white border border-gray-200 
                      rounded-lg shadow dark:bg-gray-800 dark:border-gray-700
                      
                      `}
                  >
                    <img
                      class='w-full'
                      src={formatImageUrl(item.data.display.data.image_url)}
                      alt=''
                    />
                    <div class='p-5'>
                      <p class='mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white'>
                        {item.data.display.data.name}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            {renderNftSelectorModel(walletKit, handleNftSelectorOnConfirm)}
          </div>
        </div>
        <div className='w-1/2'>
          <div className='ml-2 my-2 h-full'>
            <p className='text-white'>Participant Addresses</p>
            <textarea
              className='w-full h-3/4 rounded p-2 overflow-x-auto text-xs'
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
              onClick={() => {
                window.location.reload();
              }}
            >
              Create Another Raffle
            </button>
          </div>
        )) ||
        (!currentRaffleObjId && (
          <button
            className='w-full bg-blue-500 hover:bg-blue-700 rounded-lg px-4 py-1 text-white'
            onClick={handleStartRaffle}
            disabled={!addresses}
          >
            Start Raffle {getNetworkIgnoreError(walletKit, 'on ')}
          </button>
        )) || (
          <button
            className='w-full bg-green-500 hover:bg-green-700 rounded-lg px-4 py-1 text-white'
            onClick={handleSettleRaffle}
          >
            Settle Raffle {getNetworkIgnoreError(walletKit, 'on ')}
          </button>
        )}
      {}
    </div>
  );
}
