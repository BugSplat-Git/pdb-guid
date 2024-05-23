import { pdbSignature, peSignature, verifyPdbSignature, verifyPeSignature } from '../src/signature';

describe('signature', () => {
    describe('verifyPdbSignature', () => {
        it('should verify pdb signature', async () => {
            const buffer = Buffer.from(pdbSignature);
            const fakeStream: jasmine.SpyObj<any> = jasmine.createSpyObj('ReadableStream', ['getReader']);
            const fakeReader: jasmine.SpyObj<any> = jasmine.createSpyObj('ReadableStreamDefaultReader', ['read', 'releaseLock']);
            const blob: jasmine.SpyObj<Blob> = jasmine.createSpyObj('Blob', ['slice', 'stream']);
            blob.slice.and.returnValue(blob);
            blob.stream.and.returnValue(fakeStream);
            fakeStream.getReader.and.returnValue(fakeReader);
            fakeReader.read.and.resolveTo({ done: false, value: buffer });

            const { success, error } = await verifyPdbSignature(blob);

            expect(success).toBeTrue();
            expect(error).toBeUndefined();
        });

        it('should return error if wrong number of bytes read', async () => {
            const buffer = Buffer.from(pdbSignature);
            const shorterBuffer = buffer.subarray(0, buffer.length - 1);
            const fakeStream: jasmine.SpyObj<any> = jasmine.createSpyObj('ReadableStream', ['getReader']);
            const fakeReader: jasmine.SpyObj<any> = jasmine.createSpyObj('ReadableStreamDefaultReader', ['read', 'releaseLock']);
            const blob: jasmine.SpyObj<Blob> = jasmine.createSpyObj('Blob', ['slice', 'stream']);
            blob.slice.and.returnValue(blob);
            blob.stream.and.returnValue(fakeStream);
            fakeStream.getReader.and.returnValue(fakeReader);
            fakeReader.read.and.resolveTo({ done: false, value: shorterBuffer });

            const { success, error } = await verifyPdbSignature(blob);

            expect(success).toBeFalse();
            expect(error?.message).toMatch(/wrong number of bytes read/);
        });

        it('should return error if invalid signature', async () => {
            const badBuffer = Buffer.from(pdbSignature);
            const fakeStream: jasmine.SpyObj<any> = jasmine.createSpyObj('ReadableStream', ['getReader']);
            const fakeReader: jasmine.SpyObj<any> = jasmine.createSpyObj('ReadableStreamDefaultReader', ['read', 'releaseLock']);
            const blob: jasmine.SpyObj<Blob> = jasmine.createSpyObj('Blob', ['slice', 'stream']);
            badBuffer[0] = 0;
            blob.slice.and.returnValue(blob);
            blob.stream.and.returnValue(fakeStream);
            fakeStream.getReader.and.returnValue(fakeReader);
            fakeReader.read.and.resolveTo({ done: false, value: badBuffer });

            const { success, error } = await verifyPdbSignature(blob);

            expect(success).toBeFalse();
            expect(error?.message).toMatch(/Invalid PDB signatures differ at 0/);
        });

        // TODO BG should release lock
    });

    describe('verifyPeSignature', () => {
        it('should verify pe signature', async () => {
            const buffer = Buffer.from(peSignature);
            const fakeStream: jasmine.SpyObj<any> = jasmine.createSpyObj('ReadableStream', ['getReader']);
            const fakeReader: jasmine.SpyObj<any> = jasmine.createSpyObj('ReadableStreamDefaultReader', ['read', 'releaseLock']);
            const blob: jasmine.SpyObj<Blob> = jasmine.createSpyObj('Blob', ['slice', 'stream']);
            blob.slice.and.returnValue(blob);
            blob.stream.and.returnValue(fakeStream);
            fakeStream.getReader.and.returnValue(fakeReader);
            fakeReader.read.and.resolveTo({ done: false, value: buffer });

            const { success, error } = await verifyPeSignature(blob, 0);

            expect(success).toBeTrue();
            expect(error).toBeUndefined();
        });

        it('should return error if wrong number of bytes read', async () => {
            const buffer = Buffer.from(peSignature);
            const shorterBuffer = buffer.subarray(0, buffer.length - 1);
            const fakeStream: jasmine.SpyObj<any> = jasmine.createSpyObj('ReadableStream', ['getReader']);
            const fakeReader: jasmine.SpyObj<any> = jasmine.createSpyObj('ReadableStreamDefaultReader', ['read', 'releaseLock']);
            const blob: jasmine.SpyObj<Blob> = jasmine.createSpyObj('Blob', ['slice', 'stream']);
            blob.slice.and.returnValue(blob);
            blob.stream.and.returnValue(fakeStream);
            fakeStream.getReader.and.returnValue(fakeReader);
            fakeReader.read.and.resolveTo({ done: false, value: shorterBuffer });

            const { success, error } = await verifyPeSignature(blob, 0);

            expect(success).toBeFalse();
            expect(error?.message).toMatch(/wrong number of bytes read/);
        });

        it('should return error if invalid signature', async () => {
            const badBuffer = Buffer.from(peSignature);
            const fakeStream: jasmine.SpyObj<any> = jasmine.createSpyObj('ReadableStream', ['getReader']);
            const fakeReader: jasmine.SpyObj<any> = jasmine.createSpyObj('ReadableStreamDefaultReader', ['read', 'releaseLock']);
            const blob: jasmine.SpyObj<Blob> = jasmine.createSpyObj('Blob', ['slice', 'stream']);
            badBuffer[0] = 0;
            blob.slice.and.returnValue(blob);
            blob.stream.and.returnValue(fakeStream);
            fakeStream.getReader.and.returnValue(fakeReader);
            fakeReader.read.and.resolveTo({ done: false, value: badBuffer });

            const { success, error } = await verifyPeSignature(blob, 0);

            expect(success).toBeFalse();
            expect(error?.message).toMatch(/Invalid PE signatures differ at 0/);
        });
    });
});