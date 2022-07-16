class TableMetadata {

    #table;

    #dimensionMembers;

    constructor(table) {
        this.#table = table;
        this.#verifyCountConsistency();
        this.#loadDimensionMembers();
    }

    #verifyCountConsistency() {
        let t = this.#table;
        let count = -1;

        if(this.dimensions.length === 0) {
            throw Error("The table does not have any dimension (type 'string') column");
        } else if(this.measures.length === 0) {
            throw Error("The table does not have any measure (type 'number') column");
        } else if(!this.#validColumnsSizes()) {
            throw Error("One column array is empty or not all column arrays have the same length");
        }
    }

    #loadDimensionMembers() {
        let t = this.#table;
        let m = {};

        for(let d of this.dimensions) {
            m[d] = t[d].filter((v, i, self) => self.indexOf(v) === i); 
        }

        this.#dimensionMembers = m;
    }    

    #validColumnsSizes() {
        let valid = true;
        let t = this.#table;
        let count = -1;

        Object.keys(t).forEach(p => {
            if(count === -1) {
                count = t[p].length;
                if(count === 0) {
                    valid = false;
                }
            } else {
                if(count != t[p].length) {
                    valid = false;
                }
            }
        });
        
        return valid;
    }

    get table() {
        return this.#table;
    }

    get dimensions() {
        return Object.keys(this.#table)
            .filter(p => typeof(this.#table[p][0]) !== 'number');
    }

    get measures() {
        return Object.keys(this.#table)
            .filter(p => typeof(this.#table[p][0]) === 'number');
    }

    get rowCount() {
        return this.#table[this.dimensions[0]].length;
    }

    get dimensionMembers() {
        return this.#dimensionMembers;
    }
}

export { TableMetadata };