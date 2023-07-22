import * as React from 'react';

import { useWalletKit } from '@mysten/wallet-kit';
import getSuiProvider from '../lib/getSuiProvider';
import { CoinMetadatas } from '../lib/config';
import { moveCallSettleCoinRaffle } from '../lib/moveCallSettleCoinRaffle';
import { RafflePackageId } from '../lib/config';
import { getNetwork } from '../lib/getNetwork';
import { updateCoinMetadatas } from '../lib/updateCoinMetadatas';
import Button from '@/components/buttons/Button';
import { ImSpinner2 } from 'react-icons/im';
export function PreviousCoinRaffles() {
  const walletKit: any = useWalletKit();
  const [raffles, setRaffles] = React.useState([]);
  const [raffleFetched, setRaffleFetched] = React.useState(false);
  const [coinMetadatasReady, setCoinMetadatasReady] = React.useState(false);
  const [actionPending, setActionPending] = React.useState(Object());

  React.useEffect(() => {
    if (walletKit && walletKit.currentAccount) {
      let network = getNetwork(walletKit);
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
          let network = getNetwork(walletKit);
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
  }, [walletKit]);
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
              let icon = () => {
                if (coinMetadata.iconUrl) {
                  return (
                    <img
                      className='inline-block h-6 w-6 mx-1'
                      src={coinMetadata.iconUrl}
                    />
                  );
                } else {
                  return <></>;
                }
              };
              let prizeField = () => {
                if (coinMetadatasReady) {
                  return (
                    <span>
                      {raffle.prizeAmount / 10 ** coinMetadata.decimals}{' '}
                      {icon()}
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
                  `https://suiexplorer.com/object/${raffle.id.id}?network=https%3A%2F%2Fsui-${network}-endpoint.blockvision.org`,
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
              let displayAddress = () => {
                let network = getNetwork(walletKit);
                return (
                  <a
                    href={`https://suiexplorer.com/address/${raffle.creator}?network=https%3A%2F%2Fsui-${network}-endpoint.blockvision.org`}
                    target='_blank'
                    className='text-blue-500 hover:text-blue-800'
                  >
                    {`${raffle.creator.substring(
                      0,
                      5
                    )}...${raffle.creator.substring(
                      raffle.creator.length - 3
                    )}`}
                  </a>
                );
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
                    {displayAddress()}
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
