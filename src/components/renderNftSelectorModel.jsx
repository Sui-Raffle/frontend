import React from 'react';
import SelectNFTModal from './SelectNFTModal';

export function renderNftSelectorModel(walletKit, onConfirm) {
  if (walletKit && walletKit.currentAccount) {
    return (
      <SelectNFTModal
        title={'Select NFT'}
        onConfirm={onConfirm}
        onDiscard={() => console.log('Button discard')}
        walletKit={walletKit}
        buttons={[
          {
            role: 'discard',
            toClose: true,
            classes:
              'bg-zinc-500/20 px-4 py-2 rounded-lg hover:bg-zinc-500/30 transition-all duration-200',
            label: 'Cancel',
          },
          {
            role: 'confirm',
            toClose: true,
            classes:
              'bg-green-500 px-4 py-2 rounded-lg hover:bg-green-600 transition-all duration-200 text-white',
            label: 'Confirm',
          },
        ]}
      >
        <button className='w-full bg-blue-500 hover:bg-blue-700 rounded-lg px-4 py-1 text-white'>
          Select NFT
        </button>
      </SelectNFTModal>
    );
  } else {
    return <></>;
  }
}
