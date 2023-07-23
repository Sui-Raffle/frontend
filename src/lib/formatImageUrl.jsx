export let formatImageUrl = (url) => {
  try {
    if (url.startsWith('ipfs://')) {
      return url.replace('ipfs://', 'https://ipfs.io/ipfs/');
    } else if (url.startsWith('https://')) {
      return url;
    }
    return '';
  } catch (e) {
    return '';
  }
};
