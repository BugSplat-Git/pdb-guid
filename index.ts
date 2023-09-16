import { signature } from './signature';
import { FileHandle, open } from 'node:fs/promises';

export async function getGuid(path: string): Promise<string> {
    let fileHandle: FileHandle;
    try {
        fileHandle = await open(path, 'r');
        
    } finally {
        fileHandle!?.close();
    }
    
    return 'todo bg';
}
