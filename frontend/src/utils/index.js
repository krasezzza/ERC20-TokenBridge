export function truncate(str, n) {
  return str.length > n
    ? str.substr(0, n) + '...' + str.substr(str.length - 4, str.length - 1)
    : str;
}

export function formattedAmount(amount) {
  // eslint-disable-next-line no-undef
  return BigInt(amount) * 1000000000000000000n;
}

export function networkProps(chainName) {
  const networkConfig = {
    'hardhat': {
      bridgeAddress: process.env.REACT_APP_LOCALNODE_BRIDGE_ADDRESS,
      tokenAddress: process.env.REACT_APP_LOCALNODE_TOKEN_ADDRESS
    },
    'sepolia': {
      bridgeAddress: process.env.REACT_APP_SEPOLIA_BRIDGE_ADDRESS,
      tokenAddress: process.env.REACT_APP_SEPOLIA_TOKEN_ADDRESS
    },
    'goerli': {
      bridgeAddress: process.env.REACT_APP_GOERLI_BRIDGE_ADDRESS,
      tokenAddress: process.env.REACT_APP_GOERLI_TOKEN_ADDRESS
    },
  };

  if (!chainName) {
    return networkConfig['sepolia'];
  }

  return networkConfig[chainName];
}
