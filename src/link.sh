#!/usr/bin/env bash

# 1. create a new commit file from current git commit
GIT_COMMIT=$(git rev-parse --short HEAD)
TIMESTAMP=$(date +%Y%m%d%H%M%S)
PACKAGE_VERSION=$(meteor npm -s run env echo '$npm_package_version')

echo "$PACKAGE_VERSION-$GIT_COMMIT-$TIMESTAMP" > ./lib/assets/linked/version.txt

# 2. create a list of licenses to be displayed
meteor license-checker --production  > ./lib/assets/linked/licenses.txt

# 3. create a list of contributors
CONTRIBUTORS=$(git log --pretty="%an %ae%n%cn %ce" | sort -u)
echo "$CONTRIBUTORS" > ./lib/assets/linked/contributors.txt

# 4. copy license file
cp ../LICENSE ./lib/assets/linked/
