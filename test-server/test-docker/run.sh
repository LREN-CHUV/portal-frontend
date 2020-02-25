#!/usr/bin/env bash
set -eo pipefail

echo REACT_APP_BACKEND_URL="$BACKEND_URL" | tee .env

case $1 in
watch)
    # The '| cat' is to trick Node that this is an non-TTY terminal
    # then react-scripts won't clear the console.
    yarn watch | cat
    ;;
build)
    yarn build
    ;;
test)
    te
    yarn test
    ;;
*)
    exec "$@"
    ;;
esac
