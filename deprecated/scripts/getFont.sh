#!/usr/bin/env bash

FONT_URL=$1
FILE_NAME=$(basename FONT_URL)

wget -q FONT_URL  -O src/assets/fonts/${FILE_NAME}