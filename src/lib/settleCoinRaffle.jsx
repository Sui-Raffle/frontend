import { TransactionBlock } from '@mysten/sui.js';
import { getNetwork } from './getNetwork';
import { RafflePackageId } from './config';
import { hexToUint8Array } from './hexToUint8Array';
import { getRaffleFields } from './getRaffleFields';

export let settleCoinRaffle = async ({ walletKit, raffleObjId }) => {
  let raffleFields = await getRaffleFields({ walletKit, raffleObjId });
  console.log('raffleObj:', raffleFields);

  let drand = await fetch(
    `https://drand.cloudflare.com/8990e7a9aaed2ffed73dbd7092123d6f289930540d7651336225dc172e51b2ce/public/${raffleFields.round}`
  ).then((response) => response.json());

  if (walletKit.currentAccount) {
    const tx = new TransactionBlock();
    let network = getNetwork(walletKit);
    tx.moveCall({
      target: `${RafflePackageId[network]}::raffle::settle_coin_raffle`,
      typeArguments: ['0x2::sui::SUI'],
      arguments: [
        tx.object(raffleObjId),
        tx.pure(hexToUint8Array(drand.signature), 'vector<u8>'),
        tx.pure(hexToUint8Array(drand.previous_signature), 'vector<u8>'),
      ],
    });
    const resData = await walletKit.signAndExecuteTransactionBlock({
      transactionBlock: tx,
    });
    console.log('resData', resData);
    return resData;
  }
};
