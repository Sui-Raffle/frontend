import { TransactionBlock } from '@mysten/sui.js';
import { getNetwork } from './getNetwork';
import { RafflePackageId } from './config';
import getSuiProvider from './getSuiProvider';
import { CoinMetadatas } from './config';
import { updateCoinMetadatas } from '@/lib/updateCoinMetadatas';
export let moveCallCreateNFTRaffle = async ({
  walletKit,
  addresses,
  raffleName,
  NFTs,
}) => {
  if (walletKit.currentAccount) {
    let network = getNetwork(walletKit);
    let provider = getSuiProvider(network);

    let drand = await fetch(
      `https://drand.cloudflare.com/8990e7a9aaed2ffed73dbd7092123d6f289930540d7651336225dc172e51b2ce/public/latest`
    ).then((response) => response.json());
    let round = drand.round + 2;
    const tx = new TransactionBlock();
    console.log('NFTs:', NFTs);
    const NFTs_input = NFTs.map((nft) =>
      tx.objectRef({
        objectId: nft.data.objectId,
        digest: nft.data.digest,
        version: nft.data.version,
      })
    );

    let NFT_type = NFTs[0].data.type;
    if (addresses.length < NFTs.length) {
      alert("You don't have enough participants for the number of Prize NFTs.");
      return '';
    }

    tx.moveCall({
      target: `${RafflePackageId[network]}::nft_raffle::create_nft_raffle`,
      typeArguments: [NFTs[0].data.type],
      arguments: [
        tx.pure(Array.from(new TextEncoder().encode(raffleName)), 'vector<u8>'),
        tx.pure(round, 'u64'),
        tx.pure(addresses, 'vector<address>'),
        tx.makeMoveVec({ objects: NFTs_input }),
        // tx.pure(), 'u64'),
      ],
    });

    const resData = await walletKit.signAndExecuteTransactionBlock({
      transactionBlock: tx,
    });
    console.log('resData', resData);

    return resData;
  }
};
