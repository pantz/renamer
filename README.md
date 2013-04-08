# Renamer version 0.0.1

## Description ##
Renames music files based on their ID3 tag.

Copies all music files and renames them to the following structure:
`artist - album /tracknumber - song`

## Note ##
This will copy all of the files, just because I do not want to potentially balls up your totally legal music

## Install ##
1. Extract folder into any directory (henceforth known as the project directory)
2. Install [Node.js](http://nodejs.org) and run `npm install` inside the project directory.
3. Done!

## Usage ##
1. Update `DIRECTORY` in `rename.js` to be your music directory
2. Update `OUT_DIRECTORY` to be the sub folder that you want the new music files to go into. `OUT_DIRECTORY` must be a folder within `DIRECTORY`.
3. Navigate to project directory
4. Type `node rename.js`