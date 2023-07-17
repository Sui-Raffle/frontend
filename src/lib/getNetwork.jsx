export let getNetwork = (walletKit) => {
  return walletKit.currentAccount.chains[0].split('sui:')[1];
};
