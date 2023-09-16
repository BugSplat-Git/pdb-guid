export class PdbGuid {
    constructor(
        private readonly data1: number,
        private readonly data2: number,
        private readonly data3: number,
        private readonly data4: Uint8Array,
        public readonly age?: number | undefined
    ) {}

    toString(): string {
        let value = `${this.data1.toString(16).padStart(8, '0')}${this.data2.toString(16).padStart(4, '0')}${this.data3.toString(16).padStart(4, '0')}${Array.from(this.data4).map(b => b.toString(16).padStart(2, '0')).join('')}`;
        
        if (this.age) {
            value += `${this.age.toString(16)}`;
        }

        return value.toUpperCase();
    }
}

export class PeGuid {
    constructor(
        private readonly data1: number,
        private readonly data2: number,
    ) { }

    toString(): string {
        return `${this.data1.toString(16).padStart(8, '0')}${this.data2.toString(16).padStart(4, '0')}`.toUpperCase();
    }
}