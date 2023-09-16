import { existsSync } from 'fs';
import { FileHandle, open } from 'fs/promises';
import { extname } from 'node:path';
import { PdbGuid } from './guid';
import { readInt32, sizeOfInt16, sizeOfInt32, toUInt16, toUInt32 } from './int';
import { PdbRootStream } from './root';
import { verifyPdbSignature } from './signature';

const sizeOfD4Bytes = 8;
const sizeOfD2Bytes = sizeOfInt16;
const sizeOfD1Bytes = sizeOfInt32;

// Simple PDB(program database) file parser the loads files GUID and Age fields.
// The GUID and Age values are accessible as following object members:
//    guid - PDB file's GUID as an instance of GUID class
//    age  - PDB file's Age, as an integer
export class PdbFile {
    constructor(public readonly guid: PdbGuid) { }

    get age(): number | undefined {
        return this.guid.age;
    }

    static async createFromFile(pdbFilePath: string): Promise<PdbFile> {
        if (!existsSync(pdbFilePath)) {
            throw new Error(`PDB file does not exist at path: ${pdbFilePath}`);
        }

        const extension = extname(pdbFilePath);
        
        if (extension !== '.pdb') {
            throw new Error(`File does not have .pdb extension: ${pdbFilePath}`);
        }

        let fileHandle: FileHandle;
        let pdbFile: PdbFile;
        try {
            fileHandle = await open(pdbFilePath, 'r');

            const { success, error } = await verifyPdbSignature(fileHandle);
            
            if (!success) {
                throw new Error('Could not verify pdb signature', error);
            }

            const root = await PdbRootStream.createFromFile(pdbFilePath);

            if (!root) {
                throw new Error('Could not create RootStream');
            }

            const guidBytes = await PdbFile.getGuidBytesFromPdbStream(root, fileHandle);
            const guidBytesLength = guidBytes.length;
            const numberOfIntsToSkip = 3;
            const guid_d1 = toUInt32(guidBytes, numberOfIntsToSkip * sizeOfInt32);
            const guid_d2 = toUInt16(guidBytes, numberOfIntsToSkip * sizeOfInt32 + sizeOfD1Bytes);
            const guid_d3 = toUInt16(guidBytes, numberOfIntsToSkip * sizeOfInt32 + sizeOfD1Bytes + sizeOfD2Bytes);
            const guid_d4 = guidBytes.slice(guidBytesLength - sizeOfD4Bytes, guidBytesLength);

            // Load age from the DBI information (PDB information age changes when using PDBSTR)
            // vc140.pdb however, does not have this stream,
            // so it does not have an age that can be used
            // in the hash string
            let age: number | undefined;
            const dbiStreamPages = root.getStreamPages(3);
            if (dbiStreamPages.length > 0) {
                const ageOffset = dbiStreamPages[0] * root.blockSize + 2 * 4;
                age = await readInt32(fileHandle, ageOffset) || undefined;
            } 
            
            const guid = new PdbGuid(guid_d1, guid_d2, guid_d3, guid_d4, age);
            pdbFile = new PdbFile(guid);
        } finally {
            await fileHandle!?.close();
        }

        return pdbFile;
    }

    private static async getGuidBytesFromPdbStream(root: PdbRootStream, fileHandle: FileHandle): Promise<Uint8Array> {
        const pdbStreamPages = root.getStreamPages(1);
        const guidBytesLength = 4 * sizeOfInt32 + 2 * sizeOfInt16 + sizeOfD4Bytes;
        const guidBytes = new Uint8Array(guidBytesLength);
        const fileReadOffset = pdbStreamPages[0] * root.blockSize;
        await fileHandle.read(guidBytes, 0, guidBytesLength, fileReadOffset);
        return guidBytes;
    }
}
