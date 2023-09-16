#! /usr/bin/env node
import commandLineArgs from 'command-line-args';
import commandLineUsage from 'command-line-usage';
import { extname } from 'node:path';
import { PdbFile } from '../src/pdb';
import { PeFile } from '../src/pe';
import { argDefinitions, usageDefinitions } from './command-line-definitions';

(async () => {
    let {
        path,
        help,
    } = commandLineArgs(argDefinitions);

    if (help) {
        logHelpAndExit();    
    }

    try {
        if (!path) {
            throw new Error('Missing path to .pdb, .exe, or .dll file.');
        }

        const extension = extname(path);
        
        if (extension !== '.pdb' && extension !== '.exe' && extension !== '.dll') {
            throw new Error('File does not have .pdb, .exe, or .dll extension: ' + path);
        }

        if (extension === '.pdb') {
            const pdbFile = await PdbFile.createFromFile(path);
            console.log(pdbFile.guid.toString());
            process.exit(0);
        }

        if (extension === '.exe' || extension === '.dll') {
            const peFile = await PeFile.createFromFile(path);
            console.log(peFile.guid.toString());
            process.exit(0);
        }
    } catch (error) {
        console.log((error as Error).message);
        process.exit(1);
    }
})();

function logHelpAndExit() {
    const help = commandLineUsage(usageDefinitions);
    console.log(help);
    process.exit(1);
}
