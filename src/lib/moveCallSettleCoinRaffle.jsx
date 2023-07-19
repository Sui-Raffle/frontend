import { TransactionBlock } from '@mysten/sui.js';
import { getNetwork } from './getNetwork';
import { RafflePackageId } from './config';
import { hexToUint8Array } from './hexToUint8Array';
import { getRaffleFields } from './getRaffleFields';
import { sleep } from './sleep';
export let moveCallSettleCoinRaffle = async ({ walletKit, raffleObjId }) => {
  let raffleFields = await getRaffleFields({ walletKit, raffleObjId });
  console.log('raffleFields:', raffleFields);

  console.log(
    `https://drand.cloudflare.com/8990e7a9aaed2ffed73dbd7092123d6f289930540d7651336225dc172e51b2ce/public/${raffleFields.round}`
  );
  let drand;
  try {
    drand = await fetch(
      `https://drand.cloudflare.com/8990e7a9aaed2ffed73dbd7092123d6f289930540d7651336225dc172e51b2ce/public/${raffleFields.round}`
    ).then((response) => response.json());
  } catch (e) {
    console.log(e);
    return false;
  }

  if (walletKit.currentAccount) {
    const tx = new TransactionBlock();
    let network = getNetwork(walletKit);
    tx.moveCall({
      target: `${RafflePackageId[network]}::raffle::settle_coin_raffle`,
      typeArguments: [raffleFields.coin_type],
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
