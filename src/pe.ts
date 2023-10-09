import { existsSync } from "node:fs";
import { open, FileHandle } from "node:fs/promises";
import { peSignature, verifyPeSignature } from "./signature";
import { readUInt32 } from "./int";
import { PeGuid } from "./guid";
import { extname } from "node:path";

const machineSize = 2;
const numberOfSectionSize = 2;
const timeDateStampSize = 4;
const pointerToSymbolTableSize = 4;
const numberOfSymbolsSize = 4;
const sizeOfOptionalHeaderSize = 2;
const characteristicsSize = 2;
const sizeOfImageOffset = 56;

const timeDateStampOffset = peSignature.length + machineSize + numberOfSectionSize;
const optionalHeaderOffset = peSignature.length + machineSize + numberOfSectionSize + timeDateStampSize + pointerToSymbolTableSize + numberOfSymbolsSize + sizeOfOptionalHeaderSize + characteristicsSize;

export class PeFile {
    constructor(public readonly guid: PeGuid) { }

    static async createFromFile(peFilePath: string): Promise<PeFile> {
        if (!existsSync(peFilePath)) {
            throw new Error(`PE file does not exist at path: ${peFilePath}`);
        }

        const extension = extname(peFilePath).toLowerCase();

        if (extension !== '.exe' && extension !== '.dll') {
            throw new Error(`File does not have .exe or .dll extension: ${peFilePath}`);
        }

        let fileHandle: FileHandle;
        let peFile: PeFile;
        try {
            fileHandle = await open(peFilePath, 'r');

            const peSignaturePointer = 0x3C;
            const peSignatureOffset = await readUInt32(fileHandle, peSignaturePointer);

            if (!peSignatureOffset && peSignatureOffset !== 0) {
                throw new Error('Could not read PE signature offset');
            }

            const { success, error } = await verifyPeSignature(fileHandle, peSignatureOffset);
            
            if (!success) {
                throw new Error('Could not verify PE signature', error);
            }

            const timeStamp = await readUInt32(fileHandle, peSignatureOffset + timeDateStampOffset);
            
            if (!timeStamp && timeStamp !== 0) {
                throw new Error('Could not read PE time stamp');
            }

            const sizeOfImage = await readUInt32(fileHandle, peSignatureOffset + optionalHeaderOffset + sizeOfImageOffset);
            
            if (!sizeOfImage && sizeOfImage !== 0) {
                throw new Error('Could not read PE size of image');
            }
            
            const guid = new PeGuid(timeStamp, sizeOfImage);
            peFile = new PeFile(guid);
        } finally {
            await fileHandle!?.close();
        }

        return peFile;
    }
}
