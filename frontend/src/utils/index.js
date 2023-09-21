export function truncate(str, n) {
  return str.length > n
    ? str.substr(0, n) + '...' + str.substr(str.length - 4, str.length - 1)
    : str;
}

export function network(chainName) {
  const networkConfig = {
    'Sepolia': {
      providerUrl: `${process.env.REACT_APP_SEPOLIA_PROVIDER_URL}${process.env.REACT_APP_INFURA_API_KEY}`,
      bridgeAddress: process.env.REACT_APP_SEPOLIA_BRIDGE_ADDRESS,
      tokenAddress: process.env.REACT_APP_SEPOLIA_TOKEN_ADDRESS
    },
    'Goerli': {
      providerUrl: `${process.env.REACT_APP_GOERLI_PROVIDER_URL}${process.env.REACT_APP_INFURA_API_KEY}`,
      bridgeAddress: process.env.REACT_APP_GOERLI_BRIDGE_ADDRESS,
      tokenAddress: process.env.REACT_APP_GOERLI_TOKEN_ADDRESS
    },
  };

  if (!chainName) {
    return networkConfig['Sepolia'];
  }

  return networkConfig[chainName];
}
