import getSuiProvider from './getSuiProvider';
import { CoinMetadatas } from './config';
import { sleep } from '../lib/sleep.jsx';

export async function updateCoinMetadatas(coinTypes: never[], walletKit: any) {
  let network = walletKit.currentAccount.chains[0].split('sui:')[1];
  let provider = getSuiProvider(network);
  let coinTypeSet = Array.from(new Set(coinTypes));
  for (let coinType of coinTypeSet) {
    if (CoinMetadatas[coinType]) {
      continue;
    }
    while (CoinMetadatas) {
      try {
        let coinMetadata: any = await provider?.getCoinMetadata({
          coinType,
        });
        if (coinType == '0x2::sui::SUI' && !coinMetadata.iconUrl) {
          coinMetadata.iconUrl = '/images/sui.png';
        }
        CoinMetadatas[coinType] = coinMetadata;
        break;
      } catch (e: any) {
        if (e.message == 'Rate limit') {
          await sleep(1000);
          continue;
        }
      }
    }
  }
}
