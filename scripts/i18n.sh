#!/bin/bash
# Author: Robert Niederreiter <rnix@squarewave.at>
# License: no license
# Date: 2014-07-20
#
# Requirements:
#     - python lingua (sudo pip install lingua)
#     - gettext
#
# Usage:
#     Initial catalog creation (lang is the language identifier):
#         ./i18n.sh lang
#     Updating translation and compile catalog:
#         ./i18n.sh

# configuration
DOMAIN="yafowil.widget.color"
SEACH_PATH=src/yafowil/widget/color
LOCALES_PATH=src/yafowil/widget/color/locales
# end configuration

# create locales folder if not exists
if [ ! -d "$LOCALES_PATH" ]; then
    echo "Locales directory not exists, create"
    mkdir -p $LOCALES_PATH
fi

# create pot if not exists
if [ ! -f $LOCALES_PATH/$DOMAIN.pot ]; then
	echo "Create pot file"
	touch $LOCALES_PATH/$DOMAIN.pot
fi

# no arguments, extract and update
if [ $# -eq 0 ]; then
    echo "Extract messages"
    pot-create $SEACH_PATH -o $LOCALES_PATH/$DOMAIN.pot

    echo "Update translations"
    for po in $LOCALES_PATH/*/LC_MESSAGES/$DOMAIN.po; do
        msgmerge -o $po $po $LOCALES_PATH/$DOMAIN.pot
    done

    echo "Compile message catalogs"
    for po in $LOCALES_PATH/*/LC_MESSAGES/*.po; do
        msgfmt -o ${po%.*}.mo $po
    done

# first argument represents language identifier, create catalog
else
    cd $LOCALES_PATH
    mkdir -p $1/LC_MESSAGES
    msginit -i $DOMAIN.pot -o $1/LC_MESSAGES/$DOMAIN.po -l $1
fi
