import { ConnectButton, useWalletKit } from '@mysten/wallet-kit';
import { formatAddress } from '@mysten/sui.js';

export function ConnectToWallet() {
  let { currentAccount } = useWalletKit();

  let address;
  try {
    address = formatAddress(currentAccount.address);
  } catch (e) {
    address = '';
  }
  return (
    <ConnectButton
      connectText={'Connect Wallet'}
      connectedText={`Connected: ${address}`}
    />
  );
}
