#!/bin/bash
set -e
echo "Pulling latest..."
git pull
echo "check node version"
node -v
echo "Checking NPM updates.."
npm i -g npm-check-updates
ncu -u
echo "Updating NPM packages.."
npm install

CURRENT_VERSION_STRING=$(jq -r '.version' package.json)
echo "Current version: ${CURRENT_VERSION_STRING}"
CURRENT_VERSION=${CURRENT_VERSION_STRING//v/}
IFS='.' read -r -a CURRENT_VERSION_ARR <<< "${CURRENT_VERSION}"
MAJOR_VERSION=${CURRENT_VERSION_ARR[0]}
MINOR_VERSION=${CURRENT_VERSION_ARR[1]}
MINOR_VERSION_NEW=$((MINOR_VERSION+1))
MAJOR_VERSION_STRING="v${MAJOR_VERSION}"
NEW_VERSION_STRING="v${MAJOR_VERSION}.${MINOR_VERSION_NEW}"
echo "New version: ${NEW_VERSION_STRING}"
if [[ "$(uname -s)" == "Darwin" ]]; then
  sed -i '' "s/${CURRENT_VERSION_STRING}/${NEW_VERSION_STRING}/" package.json
else
  sed -i "s/${CURRENT_VERSION_STRING}/${NEW_VERSION_STRING}/" package.json
fi
echo "Building"
npm run build
echo "Committing changes"
git commit -a -m "NPM Updates"
echo "Pushing changes to Github"
git push origin main

#gh release create ${NEW_VERSION_STRING} --title "Release ${NEW_VERSION_STRING}" --generate-notes --latest

echo "Move latest and ${MAJOR_VERSION_STRING} to current"
git fetch && git pull
git tag -d ${MAJOR_VERSION_STRING}
git tag -d latest
git push origin :refs/tags/${MAJOR_VERSION_STRING}
git push origin :refs/tags/latest
git tag ${NEW_VERSION_STRING}
git tag ${MAJOR_VERSION_STRING}
git tag latest
git push origin --tags
git ls-remote
echo "Done..."