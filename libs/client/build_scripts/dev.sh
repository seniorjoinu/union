#!/usr/bin/env bash
set -e

npm run copy && source .env && cd ./example && vite