#!/usr/bin/env bash
set -eo pipefail

echo REACT_APP_AUTHORIZATION="Basic c2dhMXJldmlld2VyczpIQlBzZ2Ex"
echo REACT_APP_BACKEND_URL="$BACKEND_URL" | tee .env
echo REACT_APP_TOKEN="$TOKEN" | tee -a .env
echo REACT_APP_JSESSIONID="$JSESSIONID" | tee -a .env

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
    yarn test $@
    ;;
  *)
    exec "$@"
    ;;
esac
