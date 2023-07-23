// modified from https://gist.github.com/clqu/32883b5bc2146bdc545a261b49c3c5eb
import { Fragment, useState, useEffect } from 'react';
import { Transition } from '@headlessui/react';
import { useWalletKit } from '@mysten/wallet-kit';
import getSuiProvider from '../lib/getSuiProvider';
import { getNetwork, getNetworkIgnoreError } from '../lib/getNetwork';
import { JsonRpcProvider, Connection } from '@mysten/sui.js';
import { formatImageUrl } from '../lib/formatImageUrl';

export default function SelectNFTModal({
  title = '',
  content = '',
  buttons = [],
  classes = '',
  walletKit = undefined,
  onDiscard = '',
  onConfirm = '',
  children,
}) {
  let [isOpen, setIsOpen] = useState(false);
  let [ownNFTs, setOwnNFTs] = useState([]);
  let [displayNFTs, setDisplayNFTs] = useState([]);
  let [selectedNFTs, setSelectedNFTs] = useState([]);

  useEffect(() => {
    setIsOpen(isOpen);
    if (!isOpen) {
      document.documentElement.style.overflow = 'auto';
    } else {
      document.documentElement.style.overflow = 'hidden';
    }
  }, [isOpen]);
  useEffect(() => {
    let run = async () => {
      if (walletKit && walletKit.currentAccount) {
        let address = walletKit.currentAccount.address;
        let provider = getSuiProvider(getNetwork(walletKit));
        // provider = new JsonRpcProvider();
        let ownObjects = [];
        let nextCursor = undefined;
        do {
          let res = await provider.getOwnedObjects({
            owner: address,
            options: {
              showContent: true,
              showType: true,
              showDisplay: true,
              cursor: nextCursor,
            },
          });
          ownObjects = ownObjects.concat(res.data);
          if (res.hasNextPage) {
            nextCursor = res.cursor;
          } else {
            nextCursor = undefined;
          }
          break;
        } while (nextCursor);
        let NFTs = ownObjects.filter((item) => {
          if (item.data.display.data) {
            return formatImageUrl(item.data.display.data.image_url);
          }
        });
        setOwnNFTs(NFTs);
        // console.log('NFTs:', NFTs);
      }
    };
    run();
  }, [walletKit]);

  useEffect(() => {
    if (selectedNFTs.length) {
      let currentType = selectedNFTs[0].data.type;
      setDisplayNFTs(
        ownNFTs.filter((item) => {
          return item.data.type == currentType;
        })
      );
    } else {
      setDisplayNFTs(ownNFTs);
    }
  }, [selectedNFTs, ownNFTs]);

  if (!walletKit || !walletKit.currentAccount) {
    return <></>;
  }
  let address = walletKit.currentAccount.address;
  const HandleChange = () => {
    console.log('HandleChange:');
    setIsOpen(!isOpen);
  };
  return (
    <>
      <div onClick={() => HandleChange()}>{children}</div>

      <Transition show={isOpen}>
        <Transition.Child
          as={Fragment}
          enter='transition-all duration-200'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='transition-all duration-200'
          leaveTo='opacity-0'
          leaveFrom='opacity-100'
        >
          <div
            style={{ zIndex: '1' }}
            onClick={() => HandleChange()}
            className='w-full h-full left-0 top-0 bg-black/50 fixed'
          />
        </Transition.Child>
        <Transition.Child
          as={Fragment}
          enter='transition-all duration-200'
          enterFrom='opacity-0 scale-75'
          enterTo='opacity-100 scale-100'
          leave='transition-all duration-200'
          leaveTo='opacity-0 scale-75'
          leaveFrom='opacity-100 scale-100'
        >
          <div
            style={{ zIndex: '2' }}
            className='flex justify-center items-center h-full w-full fixed inset-0'
            // onClick={() => HandleChange()}
          >
            <div
              onClick={(event) => {
                event.stopPropagation();
              }}
              className={`max-w-[72rem] w-full ${
                classes ? classes : 'p-4 bg-white rounded-lg'
              }`}
            >
              <div className='w-full flex justify-between items-center mb-6'>
                <p className='font-medium text-lg'>{title}</p>
                <div
                  onClick={() => HandleChange()}
                  className='w-8 h-8 flex justify-center items-center rounded-lg transition-all duration-200 cursor-pointer hover:bg-zinc-500/20'
                >
                  <svg
                    width='24px'
                    height='24px'
                    viewBox='0 0 36 36'
                    version='1.1'
                    preserveAspectRatio='xMidYMid meet'
                    xmlns='http://www.w3.org/2000/svg'
                    xmlnsXlink='http://www.w3.org/1999/xlink'
                  >
                    <path
                      className='clr-i-outline clr-i-outline-path-1'
                      d='M19.41,18l8.29-8.29a1,1,0,0,0-1.41-1.41L18,16.59,9.71,8.29A1,1,0,0,0,8.29,9.71L16.59,18,8.29,26.29a1,1,0,1,0,1.41,1.41L18,19.41l8.29,8.29a1,1,0,0,0,1.41-1.41Z'
                    />
                    <rect x={0} y={0} width={36} height={36} fillOpacity={0} />
                  </svg>
                </div>
              </div>
              <div
                className='grid grid-cols-1 md:grid-cols-4 gap-4 overflow-x-scroll'
                style={{ maxHeight: '70vh' }}
              >
                {displayNFTs.map((item, index) => {
                  let isSelected = selectedNFTs.includes(item);
                  function handleSelect() {
                    if (selectedNFTs.includes(item)) {
                      setSelectedNFTs(selectedNFTs.filter((i) => i !== item));
                    } else {
                      setSelectedNFTs([...selectedNFTs, item]);
                    }
                  }
                  return (
                    <div
                      key={index}
                      className={`max-w-sm bg-white border border-gray-200 
                      rounded-lg shadow dark:bg-gray-800 dark:border-gray-700
                      ${isSelected ? 'border-green-500 border-8' : ''}
                      `}
                      onClick={handleSelect}
                    >
                      <img
                        className='w-full'
                        src={formatImageUrl(item.data.display.data.image_url)}
                        alt=''
                      />
                      <div className='p-5'>
                        <h5 className='mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white'>
                          {item.data.display.data.name ||
                            item.data.display.data.description}
                        </h5>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* <p className='text-md'>{address}</p> */}
              <div className='mt-6 flex justify-end items-center gap-2'>
                {buttons.map((button, index) => (
                  <button
                    onClick={() => {
                      if (button.role === 'discard') {
                        onDiscard();
                      }
                      if (button.role === 'confirm') {
                        onConfirm(selectedNFTs);
                      }
                      if (button.role === 'custom') {
                        button.onClick();
                      }
                      if (button.toClose) {
                        setIsOpen(false);
                      }
                    }}
                    key={index}
                    className={button.classes}
                  >
                    {button.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Transition.Child>
      </Transition>
    </>
  );
}
