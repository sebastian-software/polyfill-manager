#!/bin/bash

# Skip if not having a 1 in GIT_PARAMS from husky
if [[ $HUSKY_GIT_PARAMS =~ 1$ ]]; then
  npm ci
fi