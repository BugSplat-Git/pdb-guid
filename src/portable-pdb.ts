import { PdbGuid } from './guid';
import { readUInt32FromBlob, toUInt16, toUInt32 } from './int';
import { portablePdbSignature } from './signature';

// Portable PDBs use the SSQP key convention <guid>FFFFFFFF — age is always
// UInt32.MaxValue, not the DBI age used by native MSF PDBs.
// https://github.com/dotnet/symstore/blob/main/docs/specs/SSQP_Key_Conventions.md
const PORTABLE_PDB_AGE = 0xffffffff;

// Portable PDB parser for .NET assemblies.
// Extracts the GUID from the #Pdb stream in the ECMA-335 metadata.
export class PortablePdbFile {
    constructor(public readonly guid: PdbGuid) { }

    get age(): number {
        return PORTABLE_PDB_AGE;
    }

    static async createFromBlob(fileBlob: Blob): Promise<PortablePdbFile> {
        await verifyPortablePdbSignature(fileBlob);
        const pdbStreamOffset = await findPdbStreamOffset(fileBlob);
        const guid = await readGuidFromPdbStream(fileBlob, pdbStreamOffset);
        return new PortablePdbFile(new PdbGuid(guid.d1, guid.d2, guid.d3, guid.d4, PORTABLE_PDB_AGE));
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
    //   12-15: Version string length
    //   16+:   Version string, then padding to next 4-byte boundary
    //   then:  2-byte flags, 2-byte stream count, stream headers...
    const versionLength = await readUInt32FromBlob(fileBlob, 12);

    // Version string is followed by padding to a 4-byte boundary before flags/streams.
    const streamsHeaderOffset = 16 + align4(versionLength!);
    const headerSlice = fileBlob.slice(streamsHeaderOffset, streamsHeaderOffset + 4);
    const headerBuf = new Uint8Array(await headerSlice.arrayBuffer());
    if (headerBuf.length < 4) {
        throw new Error('Could not read streams header');
    }
    const numStreams = toUInt16(headerBuf, 2);

    // Parse stream headers to find #Pdb
    let offset = streamsHeaderOffset + 4;
    for (let i = 0; i < numStreams; i++) {
        // Read fixed 8-byte stream header (offset and size)
        const headerEntrySlice = fileBlob.slice(offset, offset + 8);
        const headerEntryBuf = new Uint8Array(await headerEntrySlice.arrayBuffer());
        if (headerEntryBuf.length < 8) {
            throw new Error('Incomplete stream header entry in Portable PDB');
        }

        const streamOffset = toUInt32(headerEntryBuf, 0);
        const streamSize = toUInt32(headerEntryBuf, 4);

        // Read stream name (null-terminated, padded to 4-byte boundary)
        const nameSlice = fileBlob.slice(offset + 8, offset + 72);
        const nameBuf = new Uint8Array(await nameSlice.arrayBuffer());
        const name = readNullTerminatedString(nameBuf, 0);

        if (name === '#Pdb') {
            // PDB id is 16-byte GUID + 4-byte stamp
            if (streamSize < 20) {
                throw new Error('Portable PDB #Pdb stream is too small');
            }
            return streamOffset;
        }

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

function align4(value: number): number {
    return (value + 3) & ~3;
}
