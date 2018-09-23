#!/usr/bin/env bash

set -x
set -e

pushd api
npm install --production=false
npm run build
popd

pushd client
npm install --production=false
npm run build
popd

mv client/build ./
rm -rf client
mkdir -p client
mv build client/