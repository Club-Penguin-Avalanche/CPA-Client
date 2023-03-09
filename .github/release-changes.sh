#!/bin/bash
version=$1
version=${version/v/""}

echo "version=$version" >> $GITHUB_ENV