import { describe, expect, it } from 'vitest';
import { openAsBlob } from 'node:fs';
import { PdbRootStream } from '../src/root';

describe('root', () => {
    it('should create instance of root stream', async () => {
        const blob = await openAsBlob('./spec/support/bugsplat.pdb');
        const rootStream = await PdbRootStream.createFromBlob(blob);
        expect(rootStream).not.toBeNull();
    });
});
