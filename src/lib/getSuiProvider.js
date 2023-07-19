/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { JsonRpcProvider, Connection } from '@mysten/sui.js';
import dotenv from 'dotenv';
dotenv.config();

let getSuiProvider = (network = 'mainnet') => {
  if (network == 'mainnet') {
    let connection = new Connection({
      fullnode:
        'https://sui-mainnet.blockvision.org/v1/2SjMglFHZy5G6RUaIEm4aLLtHGP',
    });
    return new JsonRpcProvider(connection);
  } else if (network == 'testnet') {
    let connection = new Connection({
      fullnode:
        'https://sui-testnet.blockvision.org/v1/2SjqdL0L15REdMBTvvU8L4qiyoy',
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
