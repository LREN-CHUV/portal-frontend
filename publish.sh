#!/usr/bin/env bash

set -e

# git porcelain ? All changes must be commited
echo
echo "Testing for uncommited files"
count=$(git status --porcelain | wc -l)
if test $count -gt 0; then
  git status
  echo "Repository dirty. exiting..."
  exit 1
fi

# yarn lint - code must not have errors (warnings are ok)
echo
echo "Linting code"
# TODO: use docker run --rm node yarn
yarn lint

# yarn test - tests must pass !
echo
echo "Running tests"
yarn ci-test

PACKAGE_VERSION=$(node -p -e "require('./package.json').version")

echo
echo "Increment version number (see semver.org)"
echo "Current version: " $PACKAGE_VERSION
echo
echo "  1) major"
echo "  2) minor"
echo "  3) patch"

read n
case $n in
1) VERSION="major" ;;
2) VERSION="minor" ;;
3) VERSION="patch" ;;
*)
  echo "invalid option, exiting..."
  exit 1
  ;;
esac

NEXT_VERSION=$(npm --no-git-tag-version version $VERSION)
INCREMENTED_VERSION=$(echo $NEXT_VERSION | cut -c 2-)

echo "Incremented version ($VERSION): " $INCREMENTED_VERSION
echo

# Build
echo "Build the project..."
git tag $INCREMENTED_VERSION
./build.sh

echo
echo "Git commit & push"
git commit -a -m "Bumped version to $INCREMENTED_VERSION"
git push
git push --tags

echo
echo "Push on dockerhub"
BUILD_DATE=$(date --iso-8601=seconds) \
VCS_REF=$INCREMENTED_VERSION \
VERSION=$INCREMENTED_VERSION \
WORKSPACE=$WORKSPACE \
  docker push hbpmip/portal-frontend:$INCREMENTED_VERSION
docker push hbpmip/portal-frontend:latest

echo
echo "Pushed"
echo "hbpmip/portal-frontend:$INCREMENTED_VERSION"
echo "hbpmip/portal-frontend:latest"
