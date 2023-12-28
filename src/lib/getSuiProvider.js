/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { JsonRpcProvider, Connection } from '@mysten/sui.js';
import dotenv from 'dotenv';
dotenv.config();

let getSuiProvider = (network = 'mainnet') => {
  if (network == 'mainnet') {
    let connection = new Connection({
      fullnode: 'https://fullnode.mainnet.sui.io:443',
    });
    return new JsonRpcProvider(connection);
  } else if (network == 'testnet') {
    let connection = new Connection({
      fullnode: 'https://fullnode.testnet.sui.io:443',
    });
    return new JsonRpcProvider(connection);
  } else if (network == 'devnet') {
    let connection = new Connection({
      fullnode: 'https://fullnode.devnet.sui.io:443',
    });
    return new JsonRpcProvider(connection);
  }
};
export default getSuiProvider;
