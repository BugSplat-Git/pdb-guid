import dotenv from 'dotenv';
import { glob } from 'glob';
import { sep } from 'path';
import { createFromFile } from '../src/create';
dotenv.config();

describe('symsrv directory', () => {
    let symsrvPath;

    beforeEach(() => symsrvPath = process.env.SYMSRV_PATH || 'z:/SymbolServers');

    it('should return same guids as symsrv', async () => {
        const pattern = `${symsrvPath}/**/*.+(pdb|exe|dll)`;
        const options = { nodir: true, ignore: '**/Tmp/**' };
        const files = await glob(pattern, options);
        
        for (let file of files) {
            const expectedGuid = file.split(sep).at(-2)!.toLowerCase();
            const actualGuid = await createFromFile(file).then(file => file.guid.toString().toLowerCase());
            expect(actualGuid).toBe(expectedGuid);
        }
    });
});