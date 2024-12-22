import { createReadStream } from "node:fs";
import { getFilesToCopy } from './shared';
import ZipStream from 'zip-stream';


const archive = new ZipStream();

const filesToCopy = await getFilesToCopy();

function queueArchive() {
    const file = filesToCopy.pop();

    archive.entry(createReadStream(file), {
        name: "dist",
    }, (err, entry) => {
        if (err) {
           throw err; 
        }

        queueArchive()
        archive.finalize();
    })
}


queueArchive();
