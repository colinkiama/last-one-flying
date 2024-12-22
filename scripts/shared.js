import { join } from "path";
import { readdir } from "node:fs/promises";

export const PRODUCTION_FILES_DIRECTORY_NAME = 'prod/';
export const OUTPUT_DIRECTORY_NAME = 'dist/';

export const GAME_FILE_PATHS = [
    "vendor/phaser.esm.min.js",
    "favicon.png",
    "style.css"
];

export const GAME_DIR_PATHS = [
    "./assets/",
    "./src/"
];

export const GAME_PROD_FILE_REPLACEMENTS = [
    { input: `${PRODUCTION_FILES_DIRECTORY_NAME}/index.html`, output: 'index.html'}
];



export async function getFilesToCopy() {
    const filePathSearchPromises = GAME_DIR_PATHS.map((dirPath) => readdir(dirPath, { recursive: true, withFileTypes: true }));
    const finishedFilePathSearches = await Promise.all(filePathSearchPromises);
    const filePaths = GAME_FILE_PATHS.concat(finishedFilePathSearches
        .flat()
        .filter(searchResult => searchResult.isFile())
        .map(searchResult => join(searchResult.parentPath, searchResult.name)));

    return filePaths;
}
