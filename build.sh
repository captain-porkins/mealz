#!/bin/bash

# cleanup
rm -rf ./build

# build backend
cd server || exit 1
npm run build

# build frontend
cd ../client || exit 1
npm run build

# Combine builds 
cd ..
mv server/build server/server && mkdir server/build && mv server/server server/build
cp -r client/build server/build/client
