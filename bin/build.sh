#!/usr/bin/env bash

set -x
set -e

npm install --production=false
npm run build