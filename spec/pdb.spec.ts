import { PdbFile } from '../src/pdb';

describe('pdbFile', () => {
    it('should read guid of a .pdb file', async () => {
        const pdbFile = await PdbFile.createFromFile('./spec/support/bugsplat.pdb');
        expect(pdbFile.guid).toMatch(/^E546B55B6D214E86871B40AC35CD0D461$/);
    });
});