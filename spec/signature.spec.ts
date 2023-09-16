import { FileHandle } from 'node:fs/promises';
import { pdbSignature, peSignature, verifyPdbSignature, verifyPeSignature } from '../src/signature';

describe('signature', () => {
    describe('verifyPdbSignature', () => {
        it('should verify pdb signature', async () => {
            const buffer = Buffer.from(pdbSignature);
            const bytesRead = buffer.length;
            const fileHandle: jasmine.SpyObj<FileHandle> = jasmine.createSpyObj('FileHandle', ['read']);
            fileHandle.read.and.callFake(
                async (readBuffer: Buffer, offset?: number, length?: number, position?: number) => {
                    readBuffer.set(buffer, offset);
                    return { bytesRead, buffer };
                }
            );

            const { success, error } = await verifyPdbSignature(fileHandle as any);

            expect(success).toBeTrue();
            expect(error).toBeUndefined();
        });

        it('should return error if wrong number of bytes read', async () => {
            const buffer = Buffer.from(pdbSignature);
            const bytesRead = buffer.length - 1;
            const fileHandle: jasmine.SpyObj<FileHandle> = jasmine.createSpyObj('FileHandle', ['read']);
            fileHandle.read.and.callFake(
                async (readBuffer: Buffer, offset?: number, length?: number, position?: number) => {
                    readBuffer.set(buffer, offset);
                    return { bytesRead, buffer };
                }
            );

            const { success, error } = await verifyPdbSignature(fileHandle as any);

            expect(success).toBeFalse();
            expect(error?.message).toMatch(/wrong number of bytes read/);
        });

        it('should return error if invalid signature', async () => {
            const buffer = Buffer.from(pdbSignature);
            const bytesRead = buffer.length;
            const fileHandle: jasmine.SpyObj<FileHandle> = jasmine.createSpyObj('FileHandle', ['read']);
            fileHandle.read.and.callFake(
                async (readBuffer: Buffer, offset?: number, length?: number, position?: number) => {
                    readBuffer.set(buffer, offset);
                    readBuffer[0] = 0;
                    return { bytesRead, buffer };
                }
            );

            const { success, error } = await verifyPdbSignature(fileHandle as any);

            expect(success).toBeFalse();
            expect(error?.message).toMatch(/Invalid PDB signatures differ at 0/);
        });
    });

    describe('verifyPeSignature', () => {
        it('should verify pe signature', async () => {
            const buffer = Buffer.from(peSignature);
            const bytesRead = buffer.length;
            const fileHandle: jasmine.SpyObj<FileHandle> = jasmine.createSpyObj('FileHandle', ['read']);
            fileHandle.read.and.callFake(
                async (readBuffer: Buffer, offset?: number, length?: number, position?: number) => {
                    readBuffer.set(buffer, offset);
                    return { bytesRead, buffer };
                }
            );

            const { success, error } = await verifyPeSignature(fileHandle as any, 0);

            expect(success).toBeTrue();
            expect(error).toBeUndefined();
        });

        it('should return error if wrong number of bytes read', async () => {
            const buffer = Buffer.from(peSignature);
            const bytesRead = buffer.length - 1;
            const fileHandle: jasmine.SpyObj<FileHandle> = jasmine.createSpyObj('FileHandle', ['read']);
            fileHandle.read.and.callFake(
                async (readBuffer: Buffer, offset?: number, length?: number, position?: number) => {
                    readBuffer.set(buffer, offset);
                    return { bytesRead, buffer };
                }
            );

            const { success, error } = await verifyPeSignature(fileHandle as any, 0);

            expect(success).toBeFalse();
            expect(error?.message).toMatch(/wrong number of bytes read/);
        });

        it('should return error if invalid signature', async () => {
            const buffer = Buffer.from(peSignature);
            const bytesRead = buffer.length;
            const fileHandle: jasmine.SpyObj<FileHandle> = jasmine.createSpyObj('FileHandle', ['read']);
            fileHandle.read.and.callFake(
                async (readBuffer: Buffer, offset?: number, length?: number, position?: number) => {
                    readBuffer.set(buffer, offset);
                    readBuffer[0] = 0;
                    return { bytesRead, buffer };
                }
            );

            const { success, error } = await verifyPeSignature(fileHandle as any, 0);

            expect(success).toBeFalse();
            expect(error?.message).toMatch(/Invalid PE signatures differ at 0/);
        });
    });
});