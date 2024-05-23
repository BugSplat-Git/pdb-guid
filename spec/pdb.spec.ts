import { openAsBlob } from 'node:fs';
import { PdbFile } from '../src/pdb';

describe('pdbFile', () => {
    it('should read guid of a .pdb file', async () => {
        const blob = await openAsBlob('./spec/support/bugsplat.pdb');
        const pdbFile = await PdbFile.createFromBlob(blob);
        expect(pdbFile.guid).toMatch(/^E546B55B6D214E86871B40AC35CD0D461$/);
    });

    it('should read guid of an unreal .pdb file', async () => {
        const blob = await openAsBlob('./spec/support/myunrealcrasher.pdb');
        const pdbFile = await PdbFile.createFromBlob(blob);
        expect(pdbFile.guid).toMatch(/^C0BB5F2717804AD8A2CBEAD4C9CD7FDB1$/);
    });

});