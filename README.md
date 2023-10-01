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

# deploy contracts on the localhost
npm run bc-deploy-local

# deploy contracts on the sepolia
npm run bc-deploy-sepolia

# deploy contracts on the goerli
npm run bc-deploy-goerli
```

Please create a ***blockchain/.env*** file as a copy of the ***blockchain/.env.example*** and populate your keys in order to use the deployment task for the testnet correctly.

Please also create a ***frontend/.env*** file as a copy of the ***frontend/.env.example*** and populate your REACT_APP_ keys in order to connect to the provider and the database successfully.

```
REACT_APP_LOCALNODE_PROVIDER_URL=http://localhost:8545
REACT_APP_LOCALNODE_BRIDGE_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
REACT_APP_LOCALNODE_TOKEN_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

REACT_APP_SEPOLIA_PROVIDER_URL=https://sepolia.infura.io/v3/
REACT_APP_SEPOLIA_BRIDGE_ADDRESS=0x32a5f79d36bF02d695a7D782e19Ee75E373A56F8
REACT_APP_SEPOLIA_TOKEN_ADDRESS=0xE40f0dc452ea6E9ba1A8d242e5E838A75a4C97b9

REACT_APP_GOERLI_PROVIDER_URL=https://goerli.infura.io/v3/
REACT_APP_GOERLI_BRIDGE_ADDRESS=0xE253920c91F1DEb40bbe635D3705d5f347833B7c
REACT_APP_GOERLI_TOKEN_ADDRESS=0x8D046417163C6380BE96A4c992c167eFc1663CdD
```

P.S. the ***nodesetup.sh*** script will create the .env files from the .env.example automatically and you have to populate them with a relevant data :)

For more information, you can take a look into the documents folder - there are info files related to the project requirements, system architecture and frontend wireframes.
