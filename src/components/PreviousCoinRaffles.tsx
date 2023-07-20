import * as React from 'react';

import { useWalletKit } from '@mysten/wallet-kit';
import getSuiProvider from '../lib/getSuiProvider';
import { CoinMetadatas } from '../lib/config';
import { moveCallSettleCoinRaffle } from '../lib/moveCallSettleCoinRaffle';
import { RafflePackageId } from '../lib/config';
import { updateCoinMetadatas } from '../lib/updateCoinMetadatas';
import Button from '@/components/buttons/Button';
import { ImSpinner2 } from 'react-icons/im';
export function PreviousCoinRaffles() {
  const walletKit: any = useWalletKit();
  const [raffles, setRaffles] = React.useState([]);
  const [raffleFetched, setRaffleFetched] = React.useState(false);
  const [coinMetadatasReady, setCoinMetadatasReady] = React.useState(false);
  const [actionPending, setActionPending] = React.useState(Object());

  // TODO: ray: 需要queryEvents 只發生一次就夠了，但要等 walletKit Ready
  // 另外，使用者應該可以手動觸發重整，因為可以透過 RaffleEventsNextCursor 找到更之前的資料，但這等 Event 夠多再來寫
  if (walletKit && walletKit.currentAccount && !raffleFetched) {
    setRaffleFetched(true);
    let network = walletKit.currentAccount.chains[0].split('sui:')[1];
    let provider = getSuiProvider(network);

    provider
      ?.queryEvents({
        query: {
          MoveEventType: `${RafflePackageId[network]}::raffle::CoinRaffleCreated`,
        },
      })
      .then(async (events) => {
        if (events.hasNextPage) {
          ('');
          // 等有夠多再來寫比較快
        }
        let raffeObjIds = events.data.map(
          (event: any) => event.parsedJson.raffle_id
        );
        let RafflesEventData: any = {};
        for (let index = 0; index < events.data.length; index++) {
          const event: any = events.data[index];

          RafflesEventData[event.parsedJson.raffle_id] = {
            timestampMs: event.timestampMs,
            prizeAmount: event.parsedJson.prizeAmount,
          };
        }
        let network = walletKit.currentAccount.chains[0].split('sui:')[1];
        let provider = getSuiProvider(network);

        let res = await provider?.multiGetObjects({
          ids: raffeObjIds,
          options: { showContent: true },
        });
        let raffles: any = res?.map((item: any) => {
          return {
            ...RafflesEventData[item.data.objectId],
            ...item.data.content,
            ...item.data.content.fields,
          };
        });

        setRaffles(raffles);
        let raffleTypes = raffles.map((raffle: any) =>
          getRaffleCoinType(raffle.type)
        );
        await updateCoinMetadatas(raffleTypes, walletKit);
        setCoinMetadatasReady(true);
      });
  }
  // if (createRaffleEvents.length) {
  //   let newRaffleEvents = updateRaffleEventsCoinMetadata(
  //     createRaffleEvents,
  //     walletKit
  //   );
  // }

  if (raffles.length) {
    return (
      <div className=''>
        <table className='min-w-full divide-y divide-gray-200 text-left'>
          <thead>
            <tr>
              <th className='py-3 px-6 bg-gray-50 text-left text-xs font-medium text-gray-500  tracking-wider'>
                #
              </th>
              <th className='py-3 px-6 bg-gray-50 text-left text-xs font-medium text-gray-500  tracking-wider'>
                Name
              </th>
              <th className='py-3 px-6 bg-gray-50 text-left text-xs font-medium text-gray-500  tracking-wider'>
                Timestamp
              </th>
              <th className='py-3 px-6 bg-gray-50 text-left text-xs font-medium text-gray-500  tracking-wider'>
                Creator
              </th>
              <th className='py-3 px-6 bg-gray-50 text-left text-xs font-medium text-gray-500  tracking-wider'>
                Total Reward
              </th>
              <th className='py-3 px-6 bg-gray-50 text-left text-xs font-medium text-gray-500  tracking-wider'>
                Participants
              </th>
              <th className='py-3 px-6 bg-gray-50 text-left text-xs font-medium text-gray-500  tracking-wider'>
                %
              </th>
              <th className='py-3 px-6 bg-gray-50 text-left text-xs font-medium text-gray-500  tracking-wider'>
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {raffles.map((raffle: any, index) => {
              let coinMetadata = CoinMetadatas[getRaffleCoinType(raffle.type)];
              let settleRaffleButtonId = `settle-raffle-${index}-${raffle.id.id}`;
              let prizeField = () => {
                if (coinMetadatasReady) {
                  return (
                    <span>
                      {raffle.prizeAmount / 10 ** coinMetadata.decimals}{' '}
                      {coinMetadata.name}
                    </span>
                  );
                } else {
                  return <span></span>;
                }
              };
              let handleSettleRaffle = async () => {
                actionPending[settleRaffleButtonId] = true;
                setActionPending({
                  ...actionPending,
                });
                let result = await moveCallSettleCoinRaffle({
                  raffleObjId: raffle.id.id,
                  walletKit,
                });
                if (result) {
                  raffle.status = 1;
                  setRaffles([...raffles]);
                }
                actionPending[settleRaffleButtonId] = undefined;
                setActionPending({
                  ...actionPending,
                });
              };
              let handleViewRaffle = () => {
                let network =
                  walletKit.currentAccount.chains[0].split('sui:')[1];
                window.open(
                  `https://suiexplorer.com/object/${raffle.id.id}?network=${network}`,
                  '_blank'
                );
              };
              let raffleActions = () => {
                if (raffle.status == 0) {
                  // In Progress
                  return (
                    <Button
                      className='bg-green-500 hover:bg-green-700 rounded-lg text-white'
                      onClick={handleSettleRaffle}
                      id={settleRaffleButtonId}
                      disabled={actionPending[settleRaffleButtonId]}
                      style={
                        actionPending[settleRaffleButtonId]
                          ? { cursor: 'wait' }
                          : {}
                      }
                    >
                      {actionPending[settleRaffleButtonId] && (
                        <ImSpinner2 className='animate-spin mr-2'></ImSpinner2>
                      )}
                      Settle Raffle
                    </Button>
                  );
                } else if (raffle.status == 1) {
                  // Settled
                  return (
                    <Button
                      className='bg-blue-500 hover:bg-blue-700 rounded-lg text-white'
                      onClick={handleViewRaffle}
                    >
                      View Raffle
                    </Button>
                  );
                }
              };
              return (
                <tr key={index}>
                  <td className='py-4 px-6 border-b border-gray-200'>
                    {index + 1}
                  </td>
                  <td className='py-4 px-6 border-b border-gray-200'>
                    {raffle.name}
                  </td>

                  <td className='py-4 px-6 border-b border-gray-200'>
                    {parseTimestamp(Number(raffle.timestampMs))}
                  </td>
                  <td className='py-4 px-6 border-b border-gray-200'>
                    {`${raffle.creator.substring(
                      0,
                      5
                    )}...${raffle.creator.substring(
                      raffle.creator.length - 3
                    )}`}
                  </td>
                  <td className='py-4 px-6 border-b border-gray-200'>
                    {prizeField()}
                  </td>
                  <td className='py-4 px-6 border-b border-gray-200'>
                    {raffle.participants.length}
                  </td>
                  <td className='py-4 px-6 border-b border-gray-200'>{`${raffle.winnerCount}/${raffle.participants.length}`}</td>
                  <td className='py-4 px-6 border-b border-gray-200'>
                    {raffleActions()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
  return <div>Loading</div>;
}
function parseTimestamp(timestamp: number) {
  const date = new Date(timestamp);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
function getRaffleCoinType(type: string) {
  return type.split('<')[1].split('>')[0];
}
