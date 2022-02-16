#!/usr/bin/env bash

METEOR_PACKAGE_DIRS="../../lib:../../liboauth" \
    meteor --port=8080 --settings=settings.json
