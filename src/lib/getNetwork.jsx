export let getNetwork = (walletKit) => {
  return walletKit.currentAccount.chains[0].split('sui:')[1];
};

export let getNetworkIgnoreError = (walletKit, prefix = '', postfix = '') => {
  try {
    return (
      prefix + walletKit.currentAccount.chains[0].split('sui:')[1] + postfix
    );
  } catch (e) {
    return '';
  }
};
