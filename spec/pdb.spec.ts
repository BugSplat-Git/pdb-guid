import { describe, expect, it } from 'vitest';
import { openAsBlob } from 'node:fs';
import { PdbFile } from '../src/pdb';

describe('pdbFile', () => {
    it('should read guid of a .pdb file', async () => {
        const blob = await openAsBlob('./spec/support/bugsplat.pdb');
        const pdbFile = await PdbFile.createFromBlob(blob);
        expect(pdbFile.guid.toString()).toMatch(/^E546B55B6D214E86871B40AC35CD0D461$/);
    });

    it('should read guid of an unreal .pdb file', async () => {
        const blob = await openAsBlob('./spec/support/UnrealEditor-MyUnrealCrasher.pdb');
        const pdbFile = await PdbFile.createFromBlob(blob);
        expect(pdbFile.guid.toString()).toMatch(/^369E999AF40647DF8A09C12F8B3BC2661$/);
    });

});
