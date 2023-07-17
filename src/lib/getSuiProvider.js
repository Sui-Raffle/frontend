/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { JsonRpcProvider, Connection } from '@mysten/sui.js';

let getSuiProvider = (network = 'mainnet') => {
  if (network == 'mainnet') {
    let connection = new Connection({
      fullnode: 'https://explorer-rpc.mainnet.sui.io',
    });
    return new JsonRpcProvider(connection);
  } else if (network == 'testnet') {
    let connection = new Connection({
      fullnode: 'https://explorer-rpc.testnet.sui.io',
    });
    return new JsonRpcProvider(connection);
  } else if (network == 'devnet') {
    let connection = new Connection({
      fullnode: 'https://explorer-rpc.devnet.sui.io',
    });
    return new JsonRpcProvider(connection);
  }
};
export default getSuiProvider;
