# erctwenty-tokenbridge
Solidity/Node/React representation of a token bridge

```shell
# configure the project with one command
bash nodesetup.sh

# start-up the combined development server
npm run dev

# start-up the frontend development server
npm run fe-start

# start-up the local hardhat network
npm run bc-start

# run the smart contract tests
npm run bc-test

# run the smart contract compile
npm run bc-compile

# run the smart contract coverage
npm run bc-coverage


# deployment tasks
cd blockchain

npx hardhat deploy-bridge --network {network}
npx hardhat deploy-token --network {network} --bridge-address {address} --initial-amount {amount} --token-name {name} --token-symbol {symbol}

# examples for localhost
npx hardhat deploy-local

# examples for sepolia
npx hardhat deploy-bridge --network sepolia
npx hardhat deploy-token --network sepolia --bridge-address 0x5C8b829ccF7cFA5aB9329984bb1bEac9ed444897 --initial-amount 110000000000000000000 --token-name KrasiToken --token-symbol KRT

# examples for goerli
npx hardhat deploy-bridge --network goerli
npx hardhat deploy-token --network goerli --bridge-address 0x1D728166aE0E5bcc5Ef59BCE4473830EA7bb97A8 --initial-amount 1000000000000000000 --token-name WrappedKrasiToken --token-symbol WKRT
```

Please create a ***blockchain/.env*** file as a copy of the ***blockchain/.env.example*** and populate your keys in order to use the deployment task for the testnet correctly.

Please also create a ***frontend/.env*** file as a copy of the ***frontend/.env.example*** and populate your REACT_APP_ keys in order to connect to the provider and the database successfully.

P.S. the ***nodesetup.sh*** script will create the .env files from the .env.example automatically and you have to populate them with a relevant data :)

For more information, you can take a look into the documents folder - there are info files related to the project requirements, system architecture and frontend wireframes.
