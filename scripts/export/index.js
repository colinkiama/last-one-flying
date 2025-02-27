import { createWriteStream } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { OUTPUT_DIRECTORY_NAME } from '../shared';
import { join, resolve as resolvePath } from 'node:path';
import { name, version } from '../../package.json';
import JSZip from './jszip.js';

const outputFilename = join(OUTPUT_DIRECTORY_NAME, `/${name}-${version}.zip`);
console.log(
    `Creating ${outputFilename} from files in ${OUTPUT_DIRECTORY_NAME} ...`,
);


async function exportZipFiles() {
    const zip = new JSZip();

    const directoryContents = await readdir(OUTPUT_DIRECTORY_NAME, { recursive: true, withFileTypes: true });

    const prodFilenames = directoryContents.filter((searchResult) => searchResult.isFile())
    .map((searchResult) => join(searchResult.parentPath, searchResult.name));


    for (let i = 0; i < prodFilenames.length; i++) {
        const prodFilename = prodFilenames[i];
        const file = Bun.file(prodFilename);
        zip.file(prodFilename, await file.bytes(), { createFolders: true });
    }


    zip.generateNodeStream(
        {
            type: 'nodebuffer',
            streamFiles: true,
            compression: 'DEFLATE',
            compressionOptions: {
                level: 9
            }
        },
    ).pipe(createWriteStream(outputFilename))
    .on('finish', function () {
        // JSZip generates a readable stream with a "end" event,
        // but is piped here in a writable stream which emits a "finish" event.
        console.log(`Created ${resolvePath(outputFilename)}`);
    });


}

await exportZipFiles();
