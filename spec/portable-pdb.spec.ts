import { describe, expect, it } from 'vitest';
import { openAsBlob } from 'node:fs';
import { PortablePdbFile } from '../src/portable-pdb';
import { createFromFile } from '../src/create';

describe('PortablePdbFile', () => {
    it('should read guid of a portable .pdb file', async () => {
        const blob = await openAsBlob('./spec/support/testapp.pdb');
        const pdbFile = await PortablePdbFile.createFromBlob(blob);
        expect(pdbFile.guid.toString()).toBe('8FD634ED5F9B446F94D0A5FC87765B431');
        expect(pdbFile.age).toBe(1);
    });

    it('should throw for a native pdb file', async () => {
        const blob = await openAsBlob('./spec/support/bugsplat.pdb');
        await expect(PortablePdbFile.createFromBlob(blob)).rejects.toThrow('Invalid Portable PDB signature');
    });

    it('should be returned by createFromFile for a portable pdb', async () => {
        const result = await createFromFile('./spec/support/testapp.pdb');
        expect(result).toBeInstanceOf(PortablePdbFile);
        expect(result.guid.toString()).toMatch(/^[A-F0-9]{32}1$/);
    });

    it('should return a native PdbFile for a native pdb via createFromFile', async () => {
        const result = await createFromFile('./spec/support/bugsplat.pdb');
        expect(result).not.toBeInstanceOf(PortablePdbFile);
    });
});
