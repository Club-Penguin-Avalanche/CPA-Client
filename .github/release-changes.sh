#!/bin/bash
version=$1
version=${version/v/""}

echo "version=$version" >> $GITHUB_ENV

sed -i "3s/.*/  \"version\": \"$version\",/" package.json