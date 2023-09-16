import { FileHandle } from 'node:fs/promises';

export const peSignature: number[] = [
    80, // P
    69, // E
    0, // \x00
    0, // \x00
];
export const pdbSignature: number[] = [
    77, // M
    105, // i
    99, // c
    114, // r
    111, // o
    115, // s
    111, // o
    102, // f
    116, // t
    32, //  
    67, // C
    47, // /
    67, // C
    43, // +
    43, // +
    32, //  
    77, // M
    83, // S
    70, // F
    32, //  
    55, // 7
    46, // .
    48, // 0
    48, // 0
    13, // \r
    10, // \n
    26, // \x1A
    68, // D
    83, // S
    0, // \x00
    0, // \x00
    0 // \x00
];

export type VerifySignatureResult = { success: boolean, error?: Error };

export async function verifyPdbSignature(fileHandle: FileHandle): Promise<VerifySignatureResult> {
    const bytes = new Uint8Array(pdbSignature.length);
    const { bytesRead } = await fileHandle.read(bytes, 0, pdbSignature.length);

    if (bytesRead !== pdbSignature.length) {
        return {
            success: false,
            error: new Error('Invalid PDB signature, wrong number of bytes read')
        };
    }

    for (let i = 0; i < pdbSignature.length; i++) {
        if (pdbSignature[i] !== bytes[i]) {
            return {
                success: false,
                error: new Error(`Invalid PDB signatures differ at ${i}. Expected ${pdbSignature[i]} found ${bytes[i]}`)
            };
        }
    }

    return { success: true };
}

export async function verifyPeSignature(fileHandle: FileHandle, peSignatureOffset: number): Promise<VerifySignatureResult> {
    const bytes = new Uint8Array(peSignature.length);
    const { bytesRead } = await fileHandle.read(bytes, 0, peSignature.length, peSignatureOffset);

    if (bytesRead !== peSignature.length) {
        return {
            success: false, 
            error: new Error('Invalid PE signature, wrong number of bytes read')
        };
    }

    for (let i = 0; i < peSignature.length; i++) {
        if (peSignature[i] !== bytes[i]) {
            return {
                success: false,
                error: new Error(`Invalid PE signatures differ at ${i}. Expected ${peSignature[i]} found ${bytes[i]}`)
            };
        }
    }

    return { success: true };
}