import { PeFile } from './pe';
import { PdbFile } from './pdb';
import { extname } from 'node:path';
import { openAsBlob } from 'node:fs';

export async function createFromFile(path: string): Promise<PdbFile | PeFile> {
    if (!path) {
        throw new Error('Missing path to .pdb, .exe, or .dll file.');
    }

    const extension = extname(path).toLowerCase();
        
    if (extension !== '.pdb' && extension !== '.exe' && extension !== '.dll') {
        throw new Error('File does not have .pdb, .exe, or .dll extension: ' + path);
    }

    const fileBlob = await openAsBlob(path);

    if (extension === '.pdb') {
        return PdbFile.createFromBlob(fileBlob);
    }

    return PeFile.createFromBlob(fileBlob);
}