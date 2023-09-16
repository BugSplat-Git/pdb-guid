import { FileHandle } from 'node:fs/promises';

export const sizeOfInt32 = 4; // sizeof(int) in C# is 4 bytes.
export const sizeOfInt16 = 2;

export function toUInt32(bytes: Uint8Array, startIndex: number): number {
    const dataView = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    return dataView.getUint32(startIndex, true);
}

export function toUInt16(bytes: Uint8Array, startIndex: number): number {
    const dataView = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    return dataView.getUint16(startIndex, true);
}

export async function readInt32(fileHandle: FileHandle, fileReadOffset: number): Promise<number | null> {
    const arr = await readInt32Array(fileHandle, fileReadOffset, 1);
    return arr ? arr[0] : null;
}

export async function readInt32Array(fileHandle: FileHandle, fileReadOffset: number, numIntsToRead: number): Promise<number[] | null> {
    const bufferLength = sizeOfInt32 * numIntsToRead;
    const buffer = Buffer.alloc(bufferLength);

    const { bytesRead } = await fileHandle.read(buffer, 0, bufferLength, fileReadOffset);

    if (bytesRead !== bufferLength) {
        throw new Error(`Could not read int32 array, read ${bytesRead} bytes instead of ${bufferLength}`);
    }

    const intArray: number[] = [];

    for (let i = 0; i < numIntsToRead; i++) {
        intArray.push(buffer.readInt32LE(i * sizeOfInt32));
    }

    return intArray;
}
