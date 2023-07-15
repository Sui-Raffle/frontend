import { useWalletKit } from "@mysten/wallet-kit";
import {
  fromSerializedSignature,
  Ed25519PublicKey,
  verifyMessage,
  TransactionBlock,
  toB64,
} from "@mysten/sui.js";

let u8VectorFromString = (str) => {
  const encodedStr = new TextEncoder().encode(str);

  let uint8s = [];
  for (const uint8 of encodedStr.values()) {
    uint8s.push(uint8);
  }
  return uint8s;
};
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

function CreateRaffleBtn() {
  let walletKit = useWalletKit();
  window.walletKit = walletKit;
  // console.log(messageWithIntent());
  let createRaffle = async () => {
    if (walletKit.currentAccount) {
      let addresses = document.getElementById("startRaffleAdresses").value;
      let startRaffleName = document.getElementById("startRaffleName").value;
      let replaceAll = function (string, search, replacement) {
        var target = string;
        return target.split(search).join(replacement);
      };
      addresses = replaceAll(addresses, " ", "").split(",");
      console.log(addresses);

      let drand = await fetch(
        `https://drand.cloudflare.com/8990e7a9aaed2ffed73dbd7092123d6f289930540d7651336225dc172e51b2ce/public/latest`
      ).then((response) => response.json());
      let round = drand.round + 2;
      const tx = new TransactionBlock();

      tx.moveCall({
        target:
          "0xb07144bb0541c4e4160fd8ab129c4440413a86a8dc871f0bcf34cde2f846716e::raffle::create_raffle",
        typeArguments: ["0x2::sui::SUI"],
        arguments: [
          tx.pure(
            Array.from(new TextEncoder().encode(startRaffleName)),
            "vector<u8>"
          ),
          tx.pure(round, "u64"),
          tx.pure(addresses, "vector<address>"),
          tx.pure(
            parseInt(
              document.getElementById("startRaffleHowManyWinners").value
            ),
            "u64"
          ),
          tx.object(document.getElementById("startRaffleTokenObjId").value),
        ],
      });

      const resData = await walletKit.signAndExecuteTransactionBlock({
        transactionBlock: tx,
      });
      console.log("resData", resData);

      let goToStartRaffleTx = document.getElementById("goToStartRaffleTx");
      goToStartRaffleTx.classList.remove("hidden");
      goToStartRaffleTx.href = `https://suiexplorer.com/txblock/${resData.digest}?network=testnet`;
    }
  };

  console.log(walletKit);
  return (
    <>
      <button
        className="bg-blue-500 hover:bg-white hover:text-blue-500 text-white font-bold py-2 px-4 rounded"
        onClick={createRaffle}
      >
        Create Raffle
      </button>
      <a
        className="bg-transparen py-2 px-4 text-white hidden"
        id="goToStartRaffleTx"
        href="#"
        target="_blank"
      >
        View Transaction
      </a>
    </>
  );
}
export { CreateRaffleBtn };
