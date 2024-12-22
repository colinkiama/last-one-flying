import { join } from "path";
import { rm } from "node:fs/promises";
import { OUTPUT_DIRECTORY_NAME, getFilesToCopy } from './shared';

let errorsFound = false;

// Delete 'dist/' directory if it exists already
await rm(OUTPUT_DIRECTORY_NAME, { force: true, recursive: true });

// Copy files to 'dist/' directory
const filePaths = await getFilesToCopy();
const fileCopyPromises = filePaths.map(filePath => {
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

if (!errorsFound) {
    console.log("Finished copying all game code files to '/dist");
}
