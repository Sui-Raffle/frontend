import { TransactionBlock } from '@mysten/sui.js';
import { getNetwork } from './getNetwork';
import { RafflePackageId } from './config';

export let createCoinRaffle = async ({
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

    let network = getNetwork(walletKit);
    tx.moveCall({
      target: `${RafflePackageId[network]}::raffle::create_raffle`,
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
