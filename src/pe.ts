import { PeGuid } from "./guid";
import { readUInt32FromBlob } from "./int";
import { peSignature, verifyPeSignature } from "./signature";

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

    static async createFromBlob(fileBlob: Blob): Promise<PeFile> {
        const peSignaturePointer = 0x3C;
        const peSignatureOffset = await readUInt32FromBlob(fileBlob, peSignaturePointer);

        if (!peSignatureOffset && peSignatureOffset !== 0) {
            throw new Error('Could not read PE signature offset');
        }

        const { success, error } = await verifyPeSignature(fileBlob, peSignatureOffset);

        if (!success) {
            throw new Error('Could not verify PE signature', error);
        }

        const timeStamp = await readUInt32FromBlob(fileBlob, peSignatureOffset + timeDateStampOffset);

        if (!timeStamp && timeStamp !== 0) {
            throw new Error('Could not read PE time stamp');
        }

        const sizeOfImage = await readUInt32FromBlob(fileBlob, peSignatureOffset + optionalHeaderOffset + sizeOfImageOffset);

        if (!sizeOfImage && sizeOfImage !== 0) {
            throw new Error('Could not read PE size of image');
        }

        const guid = new PeGuid(timeStamp, sizeOfImage);
        return new PeFile(guid);
    }
}
