#!/bin/bash

echo ""
echo "***************************"
echo "*   PROJECT NODE CLEAR!   *"
echo "***************************"
echo ""
sleep 2

if [ -d "./frontend/node_modules" ];
then
  echo "Clearing the 'frontend/node_modules' directory..."
  rm -rf ./frontend/node_modules
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

if [ -d "./blockchain/node_modules" ];
then
  echo "Clearing the 'blockchain/node_modules' directory..."
  rm -rf ./blockchain/node_modules
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

if [ -d "./node_modules" ];
then
  echo "Clearing the 'node_modules' directory..."
  rm -rf ./node_modules
  echo ""
  sleep 1
fi

if [ -f "./package-lock.json" ];
then
  echo "Clearing the 'package-lock.json' file..."
  rm -f ./package-lock.json
  echo ""
  sleep 1
fi
