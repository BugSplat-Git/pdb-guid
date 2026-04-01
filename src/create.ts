import { PeFile } from './pe';
import { PdbFile } from './pdb';
import { PortablePdbFile } from './portable-pdb';
import { extname } from 'node:path';
import { openAsBlob } from 'node:fs';
import { readUInt32FromBlob } from './int';
import { portablePdbSignature } from './signature';

export async function createFromFile(path: string): Promise<PdbFile | PeFile | PortablePdbFile> {
    if (!path) {
        throw new Error('Missing path to .pdb, .exe, or .dll file.');
    }

    const extension = extname(path).toLowerCase();

    if (extension !== '.pdb' && extension !== '.exe' && extension !== '.dll') {
        throw new Error('File does not have .pdb, .exe, or .dll extension: ' + path);
    }

    const fileBlob = await openAsBlob(path);

    if (extension === '.pdb') {
        const signature = await readUInt32FromBlob(fileBlob, 0);
        if (signature === portablePdbSignature) {
            return PortablePdbFile.createFromBlob(fileBlob);
        }

        return PdbFile.createFromBlob(fileBlob);
    }

    return PeFile.createFromBlob(fileBlob);
}