
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

export async function verifyPdbSignature(fileBlob: Blob): Promise<VerifySignatureResult> {
    const stream = fileBlob.slice(0, pdbSignature.length).stream();
    const reader = stream.getReader();

    try {
        const result = await reader.read();
        if (result.done) {
            throw new Error('No data read from file');
        }

        const bytes = new Uint8Array(result.value);
        if (bytes.length !== pdbSignature.length) {
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
    } catch (error: any) {
        return {
            success: false,
            error: new Error(`Error reading file: ${error.message}`)
        };
    } finally {
        reader.releaseLock();
    }
}

export async function verifyPeSignature(fileBlob: Blob, peSignatureOffset: number): Promise<VerifySignatureResult> {
    // Adjust the slicing to read from the specified offset and the length of the PE signature
    const blobSlice = fileBlob.slice(peSignatureOffset, peSignatureOffset + peSignature.length);
    const stream = blobSlice.stream();
    const reader = stream.getReader();

    try {
        const result = await reader.read();
        if (result.done) {
            throw new Error('No data read from file');
        }

        const bytes = new Uint8Array(result.value);
        if (bytes.length !== peSignature.length) {
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
    } catch (error: any) {
        return {
            success: false,
            error: new Error(`Error reading file: ${error.message}`)
        };
    } finally {
        reader.releaseLock();
    }
}
