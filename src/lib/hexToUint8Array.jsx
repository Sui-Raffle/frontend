export function hexToUint8Array(hexString) {
  // Remove the "0x" prefix if present
  if (hexString.startsWith('0x')) {
    hexString = hexString.slice(2);
  }

  // Ensure the hex string has an even number of characters
  if (hexString.length % 2 !== 0) {
    throw new Error('Invalid hex string');
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
  let arrayString = Array.from(uint8Array).join(', ');

  return JSON.parse(`[${arrayString}]`);
}
