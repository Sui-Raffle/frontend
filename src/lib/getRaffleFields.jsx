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
  console.log('raffleObj:', raffleObj);
  let type = raffleObj.data.type;
  return {
    type: type,
    coin_type: type.split('<')[1].split('>')[0],
    ...raffleObj.data.content.fields,
  };
};
