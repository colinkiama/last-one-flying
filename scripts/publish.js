import { $ } from 'bun';
import { version } from '../package.json';
import { OUTPUT_DIRECTORY_NAME } from './shared';

await $`butler push ${OUTPUT_DIRECTORY_NAME} colinkiama/last-one-flying:html5 --userversion ${version}`;
