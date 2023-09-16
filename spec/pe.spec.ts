import { PeFile } from '../src/pe';

describe('peFile', () => {
    it('should read guid of a .exe file', async () => {
        const pdbFile = await PeFile.createFromFile('./spec/support/bssndrpt.exe');
        expect(pdbFile.guid).toMatch(/^64FB82D565000$/);
    });

    it('should read guid of a .dll file', async () => {
        const pdbFile = await PeFile.createFromFile('./spec/support/bugsplat.dll');
        expect(pdbFile.guid).toMatch(/^64FB82ED7A000$/);
    });
});