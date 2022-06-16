#!/usr/bin/env bash
set -e

npm run clean && npm run copy && source .env && tsup-node