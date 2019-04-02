#!/bin/sh

DIR=$(dirname "$0")

cd $DIR/..

echo "Deleting old publication"
rm -rf build

if [[ $(git status -s) ]]
then
    echo "The working directory is dirty. Please commit any pending changes."
    exit 1;
fi

echo "Generating site"
yarn install
yarn run build
if [ $? -eq 0 ]; then
    echo "build success"
else
    echo "build fail"
    exit 1;
fi

echo "Checking out gh-pages branch into build"
echo "Start to build project"
rm -rf deploy
git worktree prune
rm -rf .git/worktrees/deploy/

git worktree add -B gh-pages deploy origin/gh-pages

echo "Removing existing files"
rm -rf deploy/*

echo "Updating gh-pages branch"
cp -rf build/. deploy

echo "Createing CNAME File"

echo "wallet.codechain.io" > deploy/CNAME

cd deploy && git add --all && git commit -m "Publishing to gh-pages (publish.sh)"
git push origin

cd ..
rm -rf deploy
