#!/bin/bash

echo ""
echo "****************************"
echo "*   PROJECT SETUP START!   *"
echo "****************************"
echo ""
sleep 2

if [ -d "./frontend/node_modules" ];
then
  echo "Clearing the 'frontend/node_modules' directory..."
  rm -rf ./frontend/node_modules
  echo ""
  sleep 1
fi

if [ -d "./blockchain/node_modules" ];
then
  echo "Clearing the 'blockchain/node_modules' directory..."
  rm -rf ./blockchain/node_modules
  echo ""
  sleep 1
fi

if [ -d "./blockchain/artifacts" ];
then
  echo "Clearing the 'blockchain/artifacts' directory..."
  rm -rf ./blockchain/artifacts
  echo ""
  sleep 1
fi

if [ -d "./blockchain/typechain-types" ];
then
  echo "Clearing the 'blockchain/typechain-types' directory..."
  rm -rf ./blockchain/typechain-types
  echo ""
  sleep 1
fi

if [ -d "./blockchain/cache" ];
then
  echo "Clearing the 'blockchain/cache' directory..."
  rm -rf ./blockchain/cache
  echo ""
  sleep 1
fi

if [ -d "./blockchain/coverage" ];
then
  echo "Clearing the 'blockchain/coverage' directory..."
  rm -rf ./blockchain/coverage
  echo ""
  sleep 1
fi

if [ -f "./blockchain/coverage.json" ];
then
  echo "Clearing the 'blockchain/coverage.json' file..."
  rm -f ./blockchain/coverage.json
  echo ""
  sleep 1
fi

if [ -f "./frontend/package-lock.json" ];
then
  echo "Clearing the 'frontend/package-lock.json' file..."
  rm -f ./frontend/package-lock.json
  echo ""
  sleep 1
fi

if [ -f "./blockchain/package-lock.json" ];
then
  echo "Clearing the 'blockchain/package-lock.json' file..."
  rm -f ./blockchain/package-lock.json
  echo ""
  sleep 1
fi

if [ -f "./frontend/.env" ];
then
  echo "frontend/ENV file was previously configured!"
else
  cp ./frontend/.env.example ./frontend/.env
  echo "frontend/ENV file is now configured."
fi
echo ""
sleep 1

if [ -f "./blockchain/.env" ];
then
  echo "blockchain/ENV file was previously configured!"
else
  cp ./blockchain/.env.example ./blockchain/.env
  echo "blockchain/ENV file is now configured."
fi
echo ""
sleep 1

echo "Installing frontend/node_modules..."
npm install --prefix frontend
echo ""
sleep 2

echo "Installing blockchain/node_modules..."
npm install --prefix blockchain
echo ""
sleep 2

echo "Compiling the typechain data..."
npm run bccompile
echo ""
sleep 2

echo "Running the hardhat test coverage..."
npm run bccoverage
echo ""
sleep 2

if [ -f "./blockchain/artifacts/contracts/BookLibrary.sol/BookLibrary.json" ];
then
  echo "Updating the ABI in the frontend/src/abi folder..."
  rm ./frontend/src/abi/BookLibrary.json
  cp ./blockchain/artifacts/contracts/BookLibrary.sol/BookLibrary.json ./frontend/src/abi/
  echo ""
  sleep 2
fi

echo "Starting up the frontend dev server..."
npm run festart
echo ""
sleep 2
