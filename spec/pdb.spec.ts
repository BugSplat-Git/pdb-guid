import { PdbFile } from '../src/pdb';

describe('pdbFile', () => {
    it('should throw if file does not exist', async () => {
        await expectAsync(PdbFile.createFromFile('./spec/support/does-not-exist.pdb')).toBeRejectedWithError('PDB file does not exist at path: ./spec/support/does-not-exist.pdb');
    });

    it('should throw if file does not have .pdb extension', async () => {
        await expectAsync(PdbFile.createFromFile('./spec/support/bugsplat.dll')).toBeRejectedWithError('File does not have .pdb extension: ./spec/support/bugsplat.dll');
    });

    it('should read guid of a .pdb file', async () => {
        const pdbFile = await PdbFile.createFromFile('./spec/support/bugsplat.pdb');
        expect(pdbFile.guid).toMatch(/^E546B55B6D214E86871B40AC35CD0D461$/);
    });

    it('should read guid of an unreal .pdb file', async () => {
        const pdbFile = await PdbFile.createFromFile('./spec/support/myunrealcrasher.pdb');
        expect(pdbFile.guid).toMatch(/^C0BB5F2717804AD8A2CBEAD4C9CD7FDB1$/);
    });

});