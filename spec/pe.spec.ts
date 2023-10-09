import { PeFile } from '../src/pe';

describe('peFile', () => {
    it('should throw if file does not exist', async () => {
        await expectAsync(PeFile.createFromFile('./spec/support/does-not-exist.exe')).toBeRejectedWithError('PE file does not exist at path: ./spec/support/does-not-exist.exe');
    });

    it('should throw if file does not have .exe or .dll extension', async () => {
        await expectAsync(PeFile.createFromFile('./spec/support/bugsplat.pdb')).toBeRejectedWithError('File does not have .exe or .dll extension: ./spec/support/bugsplat.pdb');
    });

    it('should read guid of a .exe file', async () => {
        const pdbFile = await PeFile.createFromFile('./spec/support/bssndrpt.exe');
        expect(pdbFile.guid).toMatch(/^64FB82D565000$/);
    });

    it('should read guid of a .dll file', async () => {
        const pdbFile = await PeFile.createFromFile('./spec/support/bugsplat.dll');
        expect(pdbFile.guid).toMatch(/^64FB82ED7A000$/);
    });

    it('should read guid of a .NET core .dll file', async () => {
        const pdbFile = await PeFile.createFromFile('./spec/support/netcore.dll');
        expect(pdbFile.guid).toMatch(/^9271620112000$/);
    });

    it('should read guid of .pdb file with no timestamp section', async () => {
        const pdbFile = await PeFile.createFromFile('./spec/support/unityengine.dll');
        expect(pdbFile.guid).toMatch(/^0000000000000000000000000000000018000$/);
    });
});