import { describe, expect, it } from 'vitest';
import { openAsBlob } from 'node:fs';
import { PeFile } from '../src/pe';

describe('peFile', () => {
    it('should read guid of a .exe file', async () => {
        const blob = await openAsBlob('./spec/support/bssndrpt.exe');
        const pdbFile = await PeFile.createFromBlob(blob);
        expect(pdbFile.guid.toString()).toMatch(/^64FB82D565000$/);
    });

    it('should read guid of a .dll file', async () => {
        const blob = await openAsBlob('./spec/support/bugsplat.dll');
        const pdbFile = await PeFile.createFromBlob(blob);
        expect(pdbFile.guid.toString()).toMatch(/^64FB82ED7A000$/);
    });

    it('should read guid of a .NET core .dll file', async () => {
        const blob = await openAsBlob('./spec/support/netcore.dll');
        const pdbFile = await PeFile.createFromBlob(blob);
        expect(pdbFile.guid.toString()).toMatch(/^9271620112000$/);
    });

    it('should read guid of .pdb file with no timestamp section', async () => {
        const blob = await openAsBlob('./spec/support/unityengine.dll');
        const pdbFile = await PeFile.createFromBlob(blob);
        expect(pdbFile.guid.toString()).toMatch(/^0000000000000000000000000000000018000$/);
    });
});
