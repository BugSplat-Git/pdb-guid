
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

export async function readUInt32FromBlob(blob: Blob, fileReadOffset: number): Promise<number | null> {
    const arr = await readUInt32ArrayFromBlob(blob, fileReadOffset, 1);
    return arr ? arr[0] : null;
}

export async function readUInt32ArrayFromBlob(blob: Blob, fileReadOffset: number, numIntsToRead: number): Promise<number[] | null> {
    const bufferLength = sizeOfInt32 * numIntsToRead;
    const blobSlice = blob.slice(fileReadOffset, fileReadOffset + bufferLength);
    const arrayBuffer = await blobSlice.arrayBuffer();

    if (arrayBuffer.byteLength !== bufferLength) {
        throw new Error(`Could not read int32 array, read ${arrayBuffer.byteLength} bytes instead of ${bufferLength}`);
    }

    const bytes = new Uint8Array(arrayBuffer);
    const intArray: number[] = [];
    for (let i = 0; i < numIntsToRead; i++) {
        intArray.push(toUInt32(bytes, i * sizeOfInt32));
    }

    return intArray;
}

