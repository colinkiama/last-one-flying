import { join } from "path";
import { cp, rm } from "node:fs/promises";

const GAME_FILE_PATHS = [
    "vendor/phaser.esm.min.js",
    "favicon.png",
    "index.html",
    "style.css"
];

const GAME_DIR_PATHS = [
    "assets/",
    "src/"
];

const OUTPUT_DIRECTORY_NAME = './dist/';

let errorsFound = false;

// Delete 'dist/' directory if it exists already
await rm(OUTPUT_DIRECTORY_NAME, { force: true, recursive: true });

// Copy files to 'dist/' directory
const fileCopyPromises = GAME_FILE_PATHS.map(filePath => {
    const input = Bun.file(filePath);
    const ouptut = Bun.file(join(OUTPUT_DIRECTORY_NAME, filePath));
    return Bun.write(ouptut, input);
});

// Wait for all of the files to be copied before continuing
try {
    const allFileCopiesPromise = Promise.all(fileCopyPromises).then(() => {
        console.log("Successfully copied files to '/dist'");
    }, (err => {
        errorsFound = true;
        throw err;
    }));

    await allFileCopiesPromise;
} catch (err) {
    console.error("Failed to copy files to '/dist'");
    throw err;
}

// Copy directories to 'dist/' directory
const dirCopyPromises = GAME_DIR_PATHS.map(dirPath => {
    return cp(dirPath, join(OUTPUT_DIRECTORY_NAME, dirPath), { recursive: true });
});

// Wait for all of the directories to be copied before continuing
try {
    const allDirCopiesPromise = Promise.all(dirCopyPromises).then(() => {
        console.log("Successfully copied directories to '/dist'");
    }, (err => {
        errorsFound = true
        throw err;
    }));

    await allDirCopiesPromise;
} catch (err) {
    console.error("Failed to copy directories to '/dist'");
    throw err;
}

if (!errorsFound) {
    console.log("Finished copying all game code files to '/dist");
}
