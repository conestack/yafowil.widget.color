#!/bin/sh

set -e

./bin/coverage run \
    --source src/yafowil/widget/color \
    --omit src/yafowil/widget/color/example.py \
    -m yafowil.widget.color.tests
./bin/coverage report
./bin/coverage html
