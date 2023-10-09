import { PeFile } from './pe';
import { PdbFile } from './pdb';
import { extname } from 'node:path';

export async function createFromFile(path: string): Promise<PdbFile | PeFile> {
    if (!path) {
        throw new Error('Missing path to .pdb, .exe, or .dll file.');
    }

    const extension = extname(path).toLowerCase();
        
    if (extension !== '.pdb' && extension !== '.exe' && extension !== '.dll') {
        throw new Error('File does not have .pdb, .exe, or .dll extension: ' + path);
    }

    if (extension === '.pdb') {
        return PdbFile.createFromFile(path);
    }

    return PeFile.createFromFile(path);
}