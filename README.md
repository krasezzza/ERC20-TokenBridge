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

P.S. the ***nodesetup.sh*** script will create the .env files from the .env.example automatically and you have to populate them with a relevant data :)

For more information, you can take a look into the documents folder - there are info files related to the project requirements, system architecture and frontend wireframes.
