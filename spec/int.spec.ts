import { readUInt32ArrayFromBlob, readUInt32FromBlob, sizeOfInt32, toUInt16, toUInt32 } from "../src/int";

describe('int', () => {
    describe('toUInt32', () => {
        it('should convert bytes to unsigned 32-bit integer', () => {
            const bytes = new Uint8Array([0, 0, 1, 0]);

            const result = toUInt32(bytes, 0);

            expect(result).toBe(65536);
        });

        it('should use offset to convert bytes to unsigned 32-bit integer', () => {
            const bytes = new Uint8Array([0, 0, 0, 0, 1, 0]);

            const result = toUInt32(bytes, 2);

            expect(result).toBe(65536);
        });
    });

    describe('toUInt16', () => {
        it('should convert bytes to unsigned 16-bit integer', () => {
            const bytes = new Uint8Array([0, 1]);

            const result = toUInt16(bytes, 0);

            expect(result).toBe(256);
        });

        it('should use offset to convert bytes to unsigned 16-bit integer', () => {
            const bytes = new Uint8Array([0, 0, 0, 1]);

            const result = toUInt16(bytes, 2);

            expect(result).toBe(256);
        });
    });

    describe('readUInt32Array', () => {
        it('should read int32 array from file', async () => {
            const buffer = Buffer.from([1, 0, 0, 0, 2, 0, 0, 0]);

            const result = await readUInt32ArrayFromBlob(new Blob([buffer]), 0, buffer.length / sizeOfInt32);

            expect(result![0]).toEqual(1);
            expect(result![1]).toEqual(2);
        });

        it('should return null if wrong number of bytes read', async () => {
            const buffer = Buffer.from([1, 0, 0, 0, 2, 0, 0, 0]);

            return expectAsync(readUInt32ArrayFromBlob(new Blob([buffer]), 8, buffer.length / sizeOfInt32)).toBeRejectedWithError(/read 0 bytes instead of 8/);
        });
    });

    describe('readUInt32', () => {
        it('should read int32 from file', async () => {
            const buffer = Buffer.from([0, 0, 0, 0, 1, 0, 0, 0]);

            const result = await readUInt32FromBlob(new Blob([buffer]), 4);

            expect(result).toEqual(1);
        });

        it('should return null if wrong number of bytes read', async () => {
            const buffer = Buffer.from([1, 0, 0, 0]);

            return expectAsync(readUInt32FromBlob(new Blob([buffer]), 4)).toBeRejectedWithError(/read 0 bytes instead of 4/);
        });
    });
});