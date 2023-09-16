import { PdbGuid, PeGuid } from '../src/guid';

describe('guid', () => {
    describe('pdbGuid', () => {
        it('should create guid with age if provided', () => {
            const guid = new PdbGuid(1, 1, 1, new Uint8Array([0, 0, 0, 0, 0, 0, 0,1]), 1);
            expect(guid.toString()).toEqual('000000010001000100000000000000011');
        });

        it('should create guid without age if not provided', () => {
            const guid = new PdbGuid(1, 1, 1, new Uint8Array([0, 0, 0, 0, 0, 0, 0,1]));
            expect(guid.toString()).toEqual('00000001000100010000000000000001');
        });
    });

    describe('peGuid', () => {
        it('should create guid', () => {
            const guid = new PeGuid(1, 1);
            expect(guid.toString()).toEqual('000000010001');
        });
    });
});