import { PdbGuid } from './guid';
import { readUInt32FromBlob, sizeOfInt32, toUInt16, toUInt32 } from './int';
import { portablePdbSignature } from './signature';

// Portable PDB parser for .NET assemblies.
// Extracts the GUID from the #Pdb stream in the ECMA-335 metadata.
// Portable PDB age is always 1.
export class PortablePdbFile {
    constructor(public readonly guid: PdbGuid) { }

    get age(): number {
        return 1;
    }

    static async createFromBlob(fileBlob: Blob): Promise<PortablePdbFile> {
        await verifyPortablePdbSignature(fileBlob);
        const pdbStreamOffset = await findPdbStreamOffset(fileBlob);
        const guid = await readGuidFromPdbStream(fileBlob, pdbStreamOffset);
        return new PortablePdbFile(new PdbGuid(guid.d1, guid.d2, guid.d3, guid.d4, 1));
    }
}

async function verifyPortablePdbSignature(fileBlob: Blob): Promise<void> {
    const signature = await readUInt32FromBlob(fileBlob, 0);
    if (signature !== portablePdbSignature) {
        throw new Error('Invalid Portable PDB signature');
    }
}

async function findPdbStreamOffset(fileBlob: Blob): Promise<number> {
    // ECMA-335 II.24.2.1 Metadata root
    //   0-3:   Signature (BSJB)
    //   4-7:   MajorVersion, MinorVersion
    //   8-11:  Reserved
    //   12-15: Version string length (padded to 4-byte boundary)
    //   16+:   Version string
    const versionLength = await readUInt32FromBlob(fileBlob, 12);
    if (versionLength === null) {
        throw new Error('Could not read version string length');
    }

    // After version string: 2-byte flags, 2-byte stream count
    const streamsHeaderOffset = 16 + versionLength;
    const headerSlice = fileBlob.slice(streamsHeaderOffset, streamsHeaderOffset + 4);
    const headerBuf = new Uint8Array(await headerSlice.arrayBuffer());
    const numStreams = toUInt16(headerBuf, 2);

    // Parse stream headers to find #Pdb
    let offset = streamsHeaderOffset + 4;
    for (let i = 0; i < numStreams; i++) {
        const entrySlice = fileBlob.slice(offset, offset + 72); // 8 bytes + up to 64 byte name
        const entryBuf = new Uint8Array(await entrySlice.arrayBuffer());

        const streamOffset = toUInt32(entryBuf, 0);
        const name = readNullTerminatedString(entryBuf, 8);

        if (name === '#Pdb') {
            return streamOffset;
        }

        // Name is null-terminated, padded to 4-byte boundary
        const paddedNameLength = Math.ceil((name.length + 1) / 4) * 4;
        offset += 8 + paddedNameLength;
    }

    throw new Error('Could not find #Pdb stream in Portable PDB');
}

async function readGuidFromPdbStream(
    fileBlob: Blob,
    pdbStreamOffset: number
): Promise<{ d1: number; d2: number; d3: number; d4: Uint8Array }> {
    // #Pdb stream layout:
    //   0-15:  PDB GUID (16 bytes)
    //   16-19: Stamp
    const guidSize = 16;
    const blobSlice = fileBlob.slice(pdbStreamOffset, pdbStreamOffset + guidSize);
    const guidBytes = new Uint8Array(await blobSlice.arrayBuffer());

    if (guidBytes.length !== guidSize) {
        throw new Error(`Expected ${guidSize} GUID bytes, got ${guidBytes.length}`);
    }

    return {
        d1: toUInt32(guidBytes, 0),
        d2: toUInt16(guidBytes, 4),
        d3: toUInt16(guidBytes, 6),
        d4: guidBytes.slice(8, 16),
    };
}

function readNullTerminatedString(buf: Uint8Array, offset: number): string {
    let end = offset;
    while (end < buf.length && buf[end] !== 0) end++;
    return new TextDecoder().decode(buf.slice(offset, end));
}
