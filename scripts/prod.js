import { join } from "path";
import { rm } from "node:fs/promises";
import { GAME_PROD_FILE_REPLACEMENTS, OUTPUT_DIRECTORY_NAME, PRODUCTION_FILES_DIRECTORY_NAME, getFilesToCopy } from './shared';

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
        console.log(`Successfully copied files to ${OUTPUT_DIRECTORY_NAME}`);
    }, (err => {
        errorsFound = true;
        throw err;
    }));

    await allFileCopiesPromise;
} catch (err) {
    console.error(`Failed to copy files to ${OUTPUT_DIRECTORY_NAME}`);
    throw err;
}

// Perform production file replacements
const productionFileCopyPromises = GAME_PROD_FILE_REPLACEMENTS.map(({input: inputPath, output: outputPath }) => {
    const input = Bun.file(inputPath);
    const output = Bun.file(join(OUTPUT_DIRECTORY_NAME, outputPath));
    return Bun.write(output, input);
})

// Wait for all of the production files to be copied before continuing
try {
    const allProductionFileCopiesPromise = Promise.all(productionFileCopyPromises).then(() => {
        console.log(`Successfully copied production files from ${PRODUCTION_FILES_DIRECTORY_NAME} to ${OUTPUT_DIRECTORY_NAME}`);
    }, (err => {
        errorsFound = true;
        throw err;
    }));

    await allProductionFileCopiesPromise;
} catch (err) {
    console.error(`Failed to copy production files from ${PRODUCTION_FILES_DIRECTORY_NAME} to ${OUTPUT_DIRECTORY_NAME}`);
    throw err;
}

if (!errorsFound) {
    console.log(`Finished copying all game code files to ${OUTPUT_DIRECTORY_NAME}`);
}
