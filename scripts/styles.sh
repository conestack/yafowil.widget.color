#!/bin/bash

SASS_BIN="./node_modules/sass/sass.js"
SASS_DIR="./scss"
TARGET_DIR="./src/yafowil/widget/color/resources"

$SASS_BIN $SASS_DIR/widget.scss --no-source-map $TARGET_DIR/widget.css
