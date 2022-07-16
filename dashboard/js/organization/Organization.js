class Organization {

    #id;

    #name;

    #email;

    #workdayId;

    #title;

    #parent;

    #children;

    constructor(resources, parentId) {
        let parent = null;
        if(parentId == undefined) {
            parent = this._findRoot(resources);
        } else {
            parent = resources.find(r => r[0] === parentId);
        }

        this._setAttributes(parent);
        this._setChildren(resources);
    }

    _setAttributes(resource) {
        this.#id        = resource[0];
        this.#name      = resource[1];
        this.#email     = resource[1];
        this.#workdayId = resource[3];
        this.#title     = resource[4];    
        this.#parent    = resource[5];
    }

    _setChildren(resources) {
        this.#children = [];
        resources.filter(r => r[5] == this.id).forEach( r =>{
            this.#children.push(new Organization(resources, r[0]));
        });
    }

    _findRoot(resources) {
        let map = {};
        resources.forEach((r) => map[r[0]] = r);

        let parent = resources[0][0];
        while(map[parent][5])
            parent = map[parent][5];

        return map[parent];
    }

    get id() {
        return this.#id;
    }

    get name() {
        return this.#name;
    }

    get email() {
        return this.#email;
    }

    get workdayId() {
        return this.#workdayId;
    }

    get title() {
        return this.#title;
    }
    get parent() {
        return this.#parent;
    }

    get children() {
        return this.#children;
    }

    get descendantCount() {
        let total = 1;
        for(let child of this.#children) {
            total += child.descendantCount;
        }

        return total;
    }

    get childCount() {
        return this.#children.length;
    }

    get depth() {
        let maxChildDepth = 0;
        for(let child of this.#children) {
            let childDepth = child.depth;
            if(childDepth > maxChildDepth) {
                maxChildDepth = childDepth;
            }
        }

        return maxChildDepth + 1;
    }
}

export { Organization };