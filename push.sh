#!/bin/bash

git push
git push osc master
git push origin master:gh-pages
npm publish