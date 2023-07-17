import getSuiProvider from './getSuiProvider';
import { getNetwork } from './getNetwork';

export let getRaffleFields = async ({ walletKit, raffleObjId }) => {
  let network = getNetwork(walletKit);
  let provider = getSuiProvider(network);

  let raffleObj = await provider.getObject({
    id: raffleObjId,
    options: {
      showContent: true,
      showType: true,
    },
  });
  return { type: raffleObj.type, ...raffleObj.data.content.fields };
};
