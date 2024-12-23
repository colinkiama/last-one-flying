import { createWriteStream } from 'node:fs';
import { OUTPUT_DIRECTORY_NAME } from './shared';
import { join, resolve as resolvePath } from 'node:path';
import { create } from 'archiver';

const ouptutFilename = join(OUTPUT_DIRECTORY_NAME, '/game.zip');
console.log(
  `Creating ${ouptutFilename} from files in ${OUTPUT_DIRECTORY_NAME} ...`,
);

const output = createWriteStream(ouptutFilename);
const archive = create('zip', {
  zlib: { level: 9 },
});

const archiveFinishPromise = new Promise((resolve) => {
  output.on('finish', () => {
    console.log(
      `Finished adding all files from ${OUTPUT_DIRECTORY_NAME} to .zip archive file.`,
    );

    resolve();
  });
});

const archiveClosePromise = new Promise((resolve) => {
  output.on('close', () => {
    console.log(`${archive.pointer()} total bytes`);
    console.log(`Created ${resolvePath(ouptutFilename)}`);
    resolve();
  });
});

// good practice to catch warnings (ie stat failures and other non-blocking errors)
archive.on('warning', (err) => {
  if (err.code === 'ENOENT') {
    // log warning
    console.log(err);
  } else {
    // throw error
    throw err;
  }
});

// good practice to catch this error explicitly
archive.on('error', (err) => {
  throw err;
});

// pipe archive data to the file
archive.pipe(output);

// append files from a sub-directory, putting its contents at the root of archive
archive.directory(OUTPUT_DIRECTORY_NAME, false);

// finalize the archive (ie we are done appending files but streams have to finish yet)
// 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
archive.finalize();

await archiveFinishPromise;
await archiveClosePromise;
