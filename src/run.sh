#!/usr/bin/env bash

METEOR_PACKAGE_DIRS="../../lib:../../liboauth" \
DISABLE_SOCKJS=1 \
    meteor --port=8080 --settings=settings.json
