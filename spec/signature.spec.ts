import { describe, expect, it, vi } from 'vitest';
import { pdbSignature, peSignature, verifyPdbSignature, verifyPeSignature } from '../src/signature';

describe('signature', () => {
    describe('verifyPdbSignature', () => {
        it('should verify pdb signature', async () => {
            const buffer = Buffer.from(pdbSignature);
            const fakeReader = {
                read: vi.fn().mockResolvedValue({ done: false, value: buffer }),
                releaseLock: vi.fn(),
            };
            const fakeStream = {
                getReader: vi.fn().mockReturnValue(fakeReader),
            };
            const blob = {
                slice: vi.fn(),
                stream: vi.fn().mockReturnValue(fakeStream),
            } as unknown as Blob;
            (blob.slice as ReturnType<typeof vi.fn>).mockReturnValue(blob);

            const { success, error } = await verifyPdbSignature(blob);

            expect(success).toBe(true);
            expect(error).toBeUndefined();
            expect(fakeReader.releaseLock).toHaveBeenCalled();
        });

        it('should return error if wrong number of bytes read', async () => {
            const buffer = Buffer.from(pdbSignature);
            const shorterBuffer = buffer.subarray(0, buffer.length - 1);
            const fakeReader = {
                read: vi.fn().mockResolvedValue({ done: false, value: shorterBuffer }),
                releaseLock: vi.fn(),
            };
            const fakeStream = {
                getReader: vi.fn().mockReturnValue(fakeReader),
            };
            const blob = {
                slice: vi.fn(),
                stream: vi.fn().mockReturnValue(fakeStream),
            } as unknown as Blob;
            (blob.slice as ReturnType<typeof vi.fn>).mockReturnValue(blob);

            const { success, error } = await verifyPdbSignature(blob);

            expect(success).toBe(false);
            expect(error?.message).toMatch(/wrong number of bytes read/);
            expect(fakeReader.releaseLock).toHaveBeenCalled();
        });

        it('should return error if invalid signature', async () => {
            const badBuffer = Buffer.from(pdbSignature);
            badBuffer[0] = 0;
            const fakeReader = {
                read: vi.fn().mockResolvedValue({ done: false, value: badBuffer }),
                releaseLock: vi.fn(),
            };
            const fakeStream = {
                getReader: vi.fn().mockReturnValue(fakeReader),
            };
            const blob = {
                slice: vi.fn(),
                stream: vi.fn().mockReturnValue(fakeStream),
            } as unknown as Blob;
            (blob.slice as ReturnType<typeof vi.fn>).mockReturnValue(blob);

            const { success, error } = await verifyPdbSignature(blob);

            expect(success).toBe(false);
            expect(error?.message).toMatch(/Invalid PDB signatures differ at 0/);
            expect(fakeReader.releaseLock).toHaveBeenCalled();
        });
    });

    describe('verifyPeSignature', () => {
        it('should verify pe signature', async () => {
            const buffer = Buffer.from(peSignature);
            const fakeReader = {
                read: vi.fn().mockResolvedValue({ done: false, value: buffer }),
                releaseLock: vi.fn(),
            };
            const fakeStream = {
                getReader: vi.fn().mockReturnValue(fakeReader),
            };
            const blob = {
                slice: vi.fn(),
                stream: vi.fn().mockReturnValue(fakeStream),
            } as unknown as Blob;
            (blob.slice as ReturnType<typeof vi.fn>).mockReturnValue(blob);

            const { success, error } = await verifyPeSignature(blob, 0);

            expect(success).toBe(true);
            expect(error).toBeUndefined();
            expect(fakeReader.releaseLock).toHaveBeenCalled();
        });

        it('should return error if wrong number of bytes read', async () => {
            const buffer = Buffer.from(peSignature);
            const shorterBuffer = buffer.subarray(0, buffer.length - 1);
            const fakeReader = {
                read: vi.fn().mockResolvedValue({ done: false, value: shorterBuffer }),
                releaseLock: vi.fn(),
            };
            const fakeStream = {
                getReader: vi.fn().mockReturnValue(fakeReader),
            };
            const blob = {
                slice: vi.fn(),
                stream: vi.fn().mockReturnValue(fakeStream),
            } as unknown as Blob;
            (blob.slice as ReturnType<typeof vi.fn>).mockReturnValue(blob);

            const { success, error } = await verifyPeSignature(blob, 0);

            expect(success).toBe(false);
            expect(error?.message).toMatch(/wrong number of bytes read/);
            expect(fakeReader.releaseLock).toHaveBeenCalled();
        });

        it('should return error if invalid signature', async () => {
            const badBuffer = Buffer.from(peSignature);
            badBuffer[0] = 0;
            const fakeReader = {
                read: vi.fn().mockResolvedValue({ done: false, value: badBuffer }),
                releaseLock: vi.fn(),
            };
            const fakeStream = {
                getReader: vi.fn().mockReturnValue(fakeReader),
            };
            const blob = {
                slice: vi.fn(),
                stream: vi.fn().mockReturnValue(fakeStream),
            } as unknown as Blob;
            (blob.slice as ReturnType<typeof vi.fn>).mockReturnValue(blob);

            const { success, error } = await verifyPeSignature(blob, 0);

            expect(success).toBe(false);
            expect(error?.message).toMatch(/Invalid PE signatures differ at 0/);
            expect(fakeReader.releaseLock).toHaveBeenCalled();
        });
    });
});
