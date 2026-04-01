import { PdbGuid } from './guid';
import { readUInt32FromBlob, sizeOfInt16, sizeOfInt32, toUInt16, toUInt32 } from './int';
import { PdbRootStream } from './root';
import { pdbSignature, verifyPdbSignature } from './signature';

const sizeOfD4Bytes = 8;
const sizeOfD2Bytes = sizeOfInt16;
const sizeOfD1Bytes = sizeOfInt32;
const guidBytesLength = 4 * sizeOfInt32 + 2 * sizeOfInt16 + sizeOfD4Bytes;

const PDB_STREAM_VERSION_VC70 = 20000404;
const DBI_VERSION_SIGNATURE = -1;
const DBI_KNOWN_VERSIONS = [930803, 19960307, 19970606, 19990903, 20091201];

// Simple PDB(program database) file parser the loads files GUID and Age fields.
// The GUID and Age values are accessible as following object members:
//    guid - PDB file's GUID as an instance of GUID class
//    age  - PDB file's Age, as an integer
export class PdbFile {
    static logger: { warn: (...args: unknown[]) => void } = console;

    constructor(public readonly guid: PdbGuid) { }

    get age(): number | undefined {
        return this.guid.age;
    }

    static async createFromBlob(fileBlob: Blob): Promise<PdbFile> {
        const { success, error } = await verifyPdbSignature(fileBlob);

        if (!success) {
            throw new Error('Could not verify pdb signature', error);
        }

        let root: PdbRootStream | null = null;
        try {
            root = await PdbRootStream.createFromBlob(fileBlob);
        } catch (e) {
            PdbFile.logger.warn('Failed to parse PDB root stream, falling back to block scan:', e);
        }

        if (root) {
            return PdbFile.createFromRootStream(root, fileBlob);
        }

        // Fallback for truncated PDBs where the block map is past the end of the file.
        // Scan for the PDB info stream and DBI stream by their known header signatures.
        return PdbFile.createFromTruncatedBlob(fileBlob);
    }

    private static async createFromRootStream(root: PdbRootStream, fileBlob: Blob): Promise<PdbFile> {
        const guidBytes = await PdbFile.getGuidBytesFromPdbStream(root, fileBlob);
        const guid = PdbFile.parseGuidFromBytes(guidBytes);

        // Load age from the DBI information (PDB information age changes when using PDBSTR)
        // vc140.pdb however, does not have this stream,
        // so it does not have an age that can be used
        // in the hash string
        let age: number | undefined;
        const dbiStreamPages = root.getStreamPages(3);
        if (dbiStreamPages.length > 0) {
            const ageOffset = dbiStreamPages[0] * root.blockSize + 2 * 4;
            age = await readUInt32FromBlob(fileBlob, ageOffset) || undefined;
        }

        return new PdbFile(new PdbGuid(guid.d1, guid.d2, guid.d3, guid.d4, age));
    }

    private static async createFromTruncatedBlob(fileBlob: Blob): Promise<PdbFile> {
        const blockSize = await readUInt32FromBlob(fileBlob, pdbSignature.length);
        if (!blockSize) {
            throw new Error('Could not read block size');
        }

        const numBlocks = Math.ceil(fileBlob.size / blockSize);
        let guid: { d1: number, d2: number, d3: number, d4: Uint8Array } | null = null;
        let age: number | undefined;

        // Scan blocks starting at block 3 (skip superblock at 0, FPMs at 1-2)
        for (let block = 3; block < numBlocks; block++) {
            const offset = block * blockSize;

            if (!guid) {
                const version = await readUInt32FromBlob(fileBlob, offset);
                if (version === PDB_STREAM_VERSION_VC70) {
                    const blobSlice = fileBlob.slice(offset, offset + guidBytesLength);
                    const guidBytes = new Uint8Array(await blobSlice.arrayBuffer());
                    guid = PdbFile.parseGuidFromBytes(guidBytes);
                }
            }

            if (age === undefined && offset + 12 <= fileBlob.size) {
                const sig = await readInt32FromBlob(fileBlob, offset);
                if (sig === DBI_VERSION_SIGNATURE) {
                    const ver = await readUInt32FromBlob(fileBlob, offset + 4);
                    if (ver !== null && DBI_KNOWN_VERSIONS.includes(ver)) {
                        age = (await readUInt32FromBlob(fileBlob, offset + 8)) || undefined;
                    }
                }
            }

            if (guid && age !== undefined) break;
        }

        if (!guid) {
            throw new Error('Could not locate PDB info stream in truncated file');
        }

        return new PdbFile(new PdbGuid(guid.d1, guid.d2, guid.d3, guid.d4, age));
    }

    private static parseGuidFromBytes(guidBytes: Uint8Array): { d1: number, d2: number, d3: number, d4: Uint8Array } {
        const numberOfIntsToSkip = 3;
        const d1 = toUInt32(guidBytes, numberOfIntsToSkip * sizeOfInt32);
        const d2 = toUInt16(guidBytes, numberOfIntsToSkip * sizeOfInt32 + sizeOfD1Bytes);
        const d3 = toUInt16(guidBytes, numberOfIntsToSkip * sizeOfInt32 + sizeOfD1Bytes + sizeOfD2Bytes);
        const d4 = guidBytes.slice(guidBytesLength - sizeOfD4Bytes, guidBytesLength);
        return { d1, d2, d3, d4 };
    }

    private static async getGuidBytesFromPdbStream(root: PdbRootStream, fileBlob: Blob): Promise<Uint8Array> {
        const pdbStreamPages = root.getStreamPages(1);

        // Calculate the file read offset based on the first page number from the stream
        const fileReadOffset = pdbStreamPages[0] * root.blockSize;

        // Create a Blob slice for the GUID bytes length starting from the calculated file read offset
        const blobSlice = fileBlob.slice(fileReadOffset, fileReadOffset + guidBytesLength);

        // Convert the Blob slice to an ArrayBuffer then to Uint8Array
        const arrayBuffer = await blobSlice.arrayBuffer();
        const guidBytes = new Uint8Array(arrayBuffer);

        // Ensure the read bytes match the expected length
        if (guidBytes.length !== guidBytesLength) {
            throw new Error(`Expected to read ${guidBytesLength} bytes for GUID, but got ${guidBytes.length} bytes.`);
        }

        return guidBytes;
    }

}

async function readInt32FromBlob(blob: Blob, offset: number): Promise<number | null> {
    const blobSlice = blob.slice(offset, offset + sizeOfInt32);
    const arrayBuffer = await blobSlice.arrayBuffer();
    if (arrayBuffer.byteLength !== sizeOfInt32) return null;
    return new DataView(arrayBuffer).getInt32(0, true);
}
