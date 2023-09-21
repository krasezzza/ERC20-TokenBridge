# erctwenty-tokenbridge
Solidity/Node/React representation of a token bridge

```shell
# configure the project with one command
bash setup.sh

# start-up the frontend development server
npm run festart

# start-up the local hardhat network
npm run bcstart

# run the smart contract tests
npm run bctest

# run the smart contract compile
npm run bccompile

# run the smart contract coverage
npm run bccoverage


# deployment tasks
cd blockchain

npx hardhat deploy-bridge --network {network}
npx hardhat deploy-token --network {network} --bridge-address {address} --initial-amount {amount} --token-name {name} --token-symbol {symbol}


# examples for sepolia
npx hardhat deploy-bridge --network sepolia
npx hardhat deploy-token --network sepolia --bridge-address 0x4B7b42A9aEfbD700d35a789De8CA700Cf19002C3 --initial-amount 110000000000000000000 --token-name KrasiToken --token-symbol KRT


# examples for goerli
npx hardhat deploy-bridge --network goerli
npx hardhat deploy-token --network goerli --bridge-address 0x1Ff9AE38238eF3763E78D82B3dD184301262D838 --initial-amount 1000000000000000000 --token-name WrappedKrasiToken --token-symbol WKRT
```

Please create a ***blockchain/.env*** file as a copy of the ***blockchain/.env.example*** and populate your keys in order to use the deployment task for the testnet correctly.

Please also create a ***frontend/.env*** file as a copy of the ***frontend/.env.example*** and populate your REACT_APP_ keys in order to connect to the provider and the database successfully.

P.S. the ***setup.sh*** script will create the .env files from the .env.example automatically and you have to populate them with a relevant data :)
