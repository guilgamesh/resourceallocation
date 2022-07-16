class TreeData {

    #table;

    #id;

    #measure;

    #columns = [];

    #properties = [];

    #measurement = 0;

    #label = "";

    #children = [];

    constructor(table, label, id) {
        id = id == undefined ? 0 : id;
        this.#table = table;
        this.#id = id;
        this.#measure = this.#tableMeasure();
        this.#columns = this.#tableColumns();
        this.#properties = this.#tableProperties();
        this.#label = label == undefined ? "" : label;
        this.#addMeasurements();

        if(this.#columns.length > 0) {
            this.#buildTreeData(id);
        }

    }

    get id() {
        return this.#id;
    }

    get children() {
        return this.#children;
    }

    get columns() {
        return this.#columns;
    }

    get measure() {
        return this.#measure;
    }

    get label() {
        return this.#label;
    }

    get measurement() {
        return this.#measurement;
    }

    labels() {
        return this.#depthFirstProperty('label');
    }

    measurements() {
        return this.#depthFirstProperty('measurement');
    }

    ids() {
        return this.#depthFirstProperty('id').map(i => `${i}`);
    }

    parents(parent) {
        let p = [ parent == undefined ? null : `${parent}`];
        let current = this.id;

        for(let c in this.children)
            p = p.concat(this.children[c].parents(current));

        return p;
    }

    #depthFirstProperty(propName) {
        let p = [this[propName]];

        for(let c in this.#children)
            p = p.concat(this.children[c].#depthFirstProperty(propName));

        return p;
    }

    #propOfLeaves(propName) {
        let p = [];

        if(this.hasChildren) {
            p.push(0);
            for(let c in this.#children) {
                p = p.concat(this.children[c].#propOfLeaves(propName));
            }
        } else {
            p.push(this[propName]);
        }

        return p;
    }

    get hasChildren() {
        return Object.keys(this.children).length > 0;
    }

    #buildTreeData(lastId) {    
        let rowMap = this.#buildRowMap();
        let children = {};

        lastId += 1;
        for(let childName in rowMap) {
            children[childName] = new TreeData(rowMap[childName], childName, lastId);
            lastId += children[childName].labels().length;
        }
    
        this.#children = children;    
    }

    #buildRowMap() {
        let t = this.#table;
        let c = this.#columns;
        let p = this.#properties;
        let n = this.#tableRowCount();

        let map = {};
        for(let i=0; i<n; i++) {

            let key = t[c[0]][i];
    
            if(!(key in map)) {
                map[key] = {};
                p.slice(1).forEach(k => map[key][k]=[]);
            }
    
            p.slice(1).forEach(k => map[key][k].push(t[k][i]));
        }

        return map;
    }

    #tableProperties() {
        let properties = Object.getOwnPropertyNames(this.#table);
    
        return properties;
    }
    
    #tableColumns() {
        let columns = Object.keys(this.#table)
            .filter(c => typeof(this.#table[c][0]) === 'string');

        return columns;
    }
    
    #tableMeasure() {
        let measures = Object.keys(this.#table)
            .filter(c => typeof(this.#table[c][0]) === 'number');
    
        if(measures.length !== 1) {
            throw Error(`The table may be empty or have more than one measure columns.`);
        }
    
        return measures[0];
    }
    
    #tableRowCount() {
        return this.#table[Object.keys(this.#table)[0]].length;
    }

    #addMeasurements() {
        this.#measurement = this.#table[this.#measure].reduce((p,c) => p + c, 0);
    }
}

export { TreeData };