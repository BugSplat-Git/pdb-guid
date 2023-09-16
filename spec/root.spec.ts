import { PdbRootStream } from '../src/root';
import { PdbFile } from '../src/pdb';

describe('root', () => {
    it('should create instance of root stream', async () => {
        const rootStream = await PdbRootStream.createFromFile('./spec/support/bugsplat.pdb');
        expect(rootStream).not.toBeNull();
    });
});
