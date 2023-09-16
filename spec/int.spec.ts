import { FileHandle } from "node:fs/promises";
import { readInt32, readInt32Array, sizeOfInt32, toUInt16, toUInt32 } from "../src/int";

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

    describe('readInt32Array', () => {
        it('should read int32 array from file', async () => {
            const buffer = Buffer.from([1, 0, 0, 0, 2, 0, 0, 0]);
            const bytesRead = buffer.length;
            const fileHandle: jasmine.SpyObj<FileHandle> = jasmine.createSpyObj('FileHandle', ['read']);
            fileHandle.read.and.callFake(
                async (readBuffer: Buffer, offset?: number, length?: number, position?: number) => {
                    readBuffer.set(buffer, offset);
                    return { bytesRead, buffer };
                }
            );

            const result = await readInt32Array(fileHandle as any, 0, buffer.length / sizeOfInt32);

            expect(result![0]).toEqual(1);
            expect(result![1]).toEqual(2);
        });

        it('should return null if wrong number of bytes read', async () => {
            const buffer = Buffer.from([1, 0, 0, 0, 2, 0, 0, 0]);
            const fileHandle: jasmine.SpyObj<FileHandle> = jasmine.createSpyObj('FileHandle', ['read']);
            fileHandle.read.and.callFake(
                async () => ({ bytesRead: 0, buffer })
            );

            return expectAsync(readInt32Array(fileHandle as any, 0, buffer.length / sizeOfInt32)).toBeRejectedWithError(/read 0 bytes instead of 8/);
        });
    });

    describe('readInt32', () => {
        it('should read int32 from file', async () => {
            const buffer = Buffer.from([0, 0, 0, 0, 1, 0, 0, 0]);
            const bytesRead = buffer.length / 2;
            const fileHandle: jasmine.SpyObj<FileHandle> = jasmine.createSpyObj('FileHandle', ['read']);
            fileHandle.read.and.callFake(
                async (readBuffer: Buffer, offset?: number, length?: number, position?: number) => {
                    readBuffer.set(buffer.slice(length, length! * 2), offset);
                    return { bytesRead, buffer };
                }
            );

            const result = await readInt32(fileHandle as any, 4);

            expect(result).toEqual(1);
        });

        it('should return null if wrong number of bytes read', async () => {
            const buffer = Buffer.from([1, 0, 0, 0]);
            const fileHandle: jasmine.SpyObj<FileHandle> = jasmine.createSpyObj('FileHandle', ['read']);
            fileHandle.read.and.callFake(
                async () => ({ bytesRead: 0, buffer })
            );

            return expectAsync(readInt32(fileHandle as any, 0)).toBeRejectedWithError(/read 0 bytes instead of 4/);
        });
    });
});