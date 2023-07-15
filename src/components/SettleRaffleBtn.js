import { useWalletKit } from "@mysten/wallet-kit";
import {
  fromSerializedSignature,
  Ed25519PublicKey,
  verifyMessage,
  TransactionBlock,
  toB64,
} from "@mysten/sui.js";

function hexToUint8Array(hexString) {
  // Remove the "0x" prefix if present
  if (hexString.startsWith("0x")) {
    hexString = hexString.slice(2);
  }

  // Ensure the hex string has an even number of characters
  if (hexString.length % 2 !== 0) {
    throw new Error("Invalid hex string");
  }

  // Create a Uint8Array with half the length of the hex string
  const length = hexString.length / 2;
  const uint8Array = new Uint8Array(length);

  // Convert each pair of hex characters to a byte and store it in the Uint8Array
  for (let i = 0; i < length; i++) {
    const byteString = hexString.substr(i * 2, 2);
    const byte = parseInt(byteString, 16);
    uint8Array[i] = byte;
  }
  let arrayString = Array.from(uint8Array).join(", ");

  return JSON.parse(`[${arrayString}]`);
}

function SettleRaffleBtn() {
  let walletKit = useWalletKit();
  window.walletKit = walletKit;
  // console.log(messageWithIntent());
  let settleRaffle = async () => {
    let raffleObjId = document.getElementById("SettleRaffleID").value;

    let response = await fetch("https://explorer-rpc.testnet.sui.io/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: `{"jsonrpc": "2.0", "id": "2", "method": "sui_getObject", "params": ["${raffleObjId}", {"showType": true, "showContent": true, "showOwner": true, "showPreviousTransaction": true, "showStorageRebate": true, "showDisplay": true}]}`,
    }).then((response) => response.json());
    console.log(response);
    let raffleObj = response.result.data.content.fields;

    let drand = await fetch(
      `https://drand.cloudflare.com/8990e7a9aaed2ffed73dbd7092123d6f289930540d7651336225dc172e51b2ce/public/${raffleObj.round}`
    ).then((response) => response.json());

    if (walletKit.currentAccount) {
      const tx = new TransactionBlock();

      tx.moveCall({
        target:
          "0xb07144bb0541c4e4160fd8ab129c4440413a86a8dc871f0bcf34cde2f846716e::raffle::settle_raffle",
        typeArguments: ["0x2::sui::SUI"],
        arguments: [
          tx.object(raffleObjId),
          tx.pure(hexToUint8Array(drand.signature), "vector<u8>"),
          tx.pure(hexToUint8Array(drand.previous_signature), "vector<u8>"),
        ],
      });
      const resData = await walletKit.signAndExecuteTransactionBlock({
        transactionBlock: tx,
      });
      console.log("resData", resData);
      let goToSettleRaffleTx = document.getElementById("goToSettleRaffleTx");
      goToSettleRaffleTx.classList.remove("hidden");
      goToSettleRaffleTx.href = `https://suiexplorer.com/txblock/${resData.digest}?network=testnet`;
    }
  };

  console.log(walletKit);
  return (
    <>
      <button
        className="bg-blue-500 hover:bg-white hover:text-blue-500 text-white font-bold py-2 px-4 rounded"
        onClick={settleRaffle}
      >
        Settle Raffle
      </button>
      <a
        className="bg-transparen py-2 px-4 text-white hidden"
        id="goToSettleRaffleTx"
        href="#"
        target="_blank"
      >
        View Transaction
      </a>
    </>
  );
}
export { SettleRaffleBtn };
