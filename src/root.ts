import { FileHandle, open } from 'node:fs/promises';
import { pdbSignature } from './signature';
import { readUInt32, readUInt32Array, sizeOfInt32, toUInt32 } from './int';

export class PdbRootStream {

    get streamsCount(): number {
        return this.streamDirectory ? this.streamDirectory[0] : 0;
    }

    private constructor(
        public readonly blockSize: number,
        public readonly directoryBytesLength: number,
        public readonly streamDirectory: number[],
    ) { }

    public getStreamPages(streamIndex: number): number[] {
        // Skip the first stream which is the signature stream (?)
        let blocksOffset = 1 + this.streamsCount;
    
        // Find the start of our read position
        for (let sidx = 0; sidx < streamIndex; sidx++) {
            const streamSize = this.getStreamSize(sidx);
            const streamPageBlockCount = getBlockCountForBytes(streamSize, this.blockSize);
            blocksOffset += streamPageBlockCount;
        }
    
        // Read the current page starting at the read position
        const numberOfBlocksToRead = getBlockCountForBytes(this.getStreamSize(streamIndex), this.blockSize);
        const streamPages = this.readStreamDirectoryUInts(blocksOffset, numberOfBlocksToRead);
        return streamPages;
    }

    private getStreamSize(streamIndex: number): number {
        if (streamIndex >= this.streamsCount) {
            throw new Error(`stream index too large: ${streamIndex}, ${this.streamsCount}`);
        }
    
        // Skip the signature stream at index 0 (?)
        return this.streamDirectory[1 + streamIndex];
    }

    private readStreamDirectoryUInts(offset: number, numberOfBlocksToRead: number): number[] {
        const uints = [] as number[];
        
        for (let i = 0; i < numberOfBlocksToRead; i++) {
            uints[i] = this.streamDirectory[offset + i * sizeOfInt32];
        }
    
        return uints;
    }

    static async createFromFile(filePath: string): Promise<PdbRootStream> {
        // LLVM.org refers to the first section of the file as The Superblock
        // At file offset 0 in an MSF file is the MSF SuperBlock, which is laid out as follows:
        //
        // struct SuperBlock {
        //  char FileMagic[sizeof(Magic)];
        //  ulittle32_t BlockSize;
        //  ulittle32_t FreeBlockMapBlock;
        //  ulittle32_t NumBlocks;
        //  ulittle32_t NumDirectoryBytes;
        //  ulittle32_t Unknown;
        //  ulittle32_t BlockMapAddr;
        // };
        let fileHandle: FileHandle;
        let pdbRootStream: PdbRootStream;
        try {
            const fileHandle = await open(filePath, 'r');

            const blockSizeReadOffset = pdbSignature.length;
            const blockSize = await readUInt32(fileHandle, blockSizeReadOffset);

            if (!blockSize) {
                throw new Error('Could not read blockSize');
            }

            const directoryBytesLengthReadOffset = pdbSignature.length + 3 * sizeOfInt32;
            const directoryBytesLength = await readUInt32(fileHandle, directoryBytesLengthReadOffset);

            if (!directoryBytesLength) {
                throw new Error('Could not read directoryBytesLength');
            }

            const blockMapAddressesCount = getBlockCountForBytes(directoryBytesLength, blockSize);
            const blockMapReadOffset = pdbSignature.length + 5 * sizeOfInt32;
            const blockMapAddress = await readUInt32(fileHandle, blockMapReadOffset);       
            
            if (!blockMapAddress) {
                throw new Error('Could not read blockMapAddress');
            }
            
            const blockMapPages = await readUInt32Array(fileHandle, blockMapAddress * blockSize, blockMapAddressesCount);
            
            if (!blockMapPages) {
                throw new Error('Could not read blockMapPages');
            }

            const rootPageData = Buffer.alloc(blockMapAddressesCount * blockSize);
            
            for (let i = 0; i < blockMapAddressesCount; i++) {
                const rootIndex = blockMapPages[i];
                const bufferOffset = i * blockSize;
                const fileReadOffset = rootIndex * blockSize;
                const { bytesRead } = await fileHandle.read(rootPageData, bufferOffset, blockSize, fileReadOffset);
                
                if (bytesRead !== blockSize) {
                    throw new Error(`Error reading root pages ${bytesRead} != ${blockSize} at index ${i}`);
                }
            }

            // Finally, read in the stream directory which is a block of uints with the following structure.
            // We store this in a single uint array.
            //
            //    struct StreamDirectory {
            //      ulittle32_t NumStreams;
            //      ulittle32_t StreamSizes[NumStreams];
            //      ulittle32_t StreamBlocks[NumStreams][];
            //    };
            const streamDirectoryBufferLength = directoryBytesLength / sizeOfInt32;
            const streamDirectory = [] as number[];
            for (let i = 0; i < streamDirectoryBufferLength; i++) {
                streamDirectory[i] = toUInt32(rootPageData, i * sizeOfInt32);
            }

            pdbRootStream = new PdbRootStream(blockSize, directoryBytesLength, streamDirectory);
        } finally {
            fileHandle!?.close();
        }

        return pdbRootStream;
    }
}

function getBlockCountForBytes(totalBytes: number, blockSize: number): number {
    return Math.ceil(totalBytes / blockSize);
}
