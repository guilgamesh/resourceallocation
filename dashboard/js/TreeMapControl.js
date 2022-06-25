import { TableMetadata }    from "./TableMetadata.js";
import { TreeData }         from "./TreeData.js";
import { TreeMapChart }     from "./TreeMapChart.js";

class TreeMapControl {

    #table;

    #dimensionMembers;

    #measures;

    #rowCount;

    #activeDimensions;

    #dimensionsPool;

    #header;

    #chartId;

    constructor(table, headerId, treeMapId) {
        this.#table = table;
        this.#header = document.getElementById(headerId);
        this.#chartId = treeMapId;

        let tableMD = new TableMetadata(table);
        this.#dimensionMembers = tableMD.dimensionMembers;
        this.#measures = tableMD.measures;
        this.#rowCount = tableMD.rowCount;

        this.#activeDimensions = [tableMD.dimensions[0]];
        this.#dimensionsPool = tableMD.dimensions.splice(1);

        this.#renderHeader();
    }

    #renderHeader() {
        this.#removeHeaderChildren();

        this.#header.appendChild(this.#renderActiveDimensions());
        this.#header.appendChild(this.#renderDimensionsPool())
        this.#header.appendChild(this.#showButton());
    }

    #removeHeaderChildren() {
        while(this.#header.children.length > 0) {
            this.#header.children[0].remove();
        }
    }   

    #renderActiveDimensions() {
        let selects = document.createElement("div");
        selects.id = "active-dimensions";

        for(let d of this.#activeDimensions) {
            let div = document.createElement("div");
            div.className = "dimension-control";

            div.appendChild(this.#labelForSelect(d));
            div.appendChild(this.#selectControl(d));

            selects.appendChild(div);
        }

        return selects;
    }

    #labelForSelect(dimensionName) {
        let label = document.createElement("label");
        label.className = 'active-dimension-label';
        label.id = `${dimensionName}-label`
        label.for = `${dimensionName}-select`;
        label.innerHTML = dimensionName;

        label.draggable = true;
        label.ondragstart   = this.#onDimensionDragStart    .bind(this);
        label.ondragover    = this.#onDimensionDragOver     .bind(this);;
        label.ondrop        = this.#onDimensionDrop         .bind(this);

        return label;
    }

    #selectControl(dimensionName) {
        let select = document.createElement("select");
        select.id = `${dimensionName}-select`;
        select.className = 'member-select';
        select.multiple = true;

        let members = this.#dimensionMembers[dimensionName];
        for(let member of members) {
            let option = document.createElement("option");
            option.value = member;
            option.innerHTML = member;
            select.appendChild(option);
        }

        return select;
    }

    #renderDimensionsPool() {
        let div = document.createElement("div");
        div.id = "dimensions-pool";
        div.ondrop = this.#onDimensionPoolDrop.bind(this);

        for(let dimension of this.#dimensionsPool) {
            let p = document.createElement("p");
            p.draggable = true;
            p.innerHTML = dimension;
            p.className = 'pool-dimension-label';

            p.ondragstart   = this.#onDimensionDragStart    .bind(this);
            p.ondragover    = this.#onDimensionDragOver     .bind(this);;
    
            div.appendChild(p);
        }

        return div;
    }

    #onDimensionPoolDrop(event) {
        let draggedDim = event.dataTransfer.getData("text/plain");
        let active = this.#activeDimensions;
        let idx = active.indexOf(draggedDim);

        if(idx >= 0) {
            event.preventDefault();
            active.splice(idx, 1);
            this.#dimensionsPool.push(draggedDim);

            this.#renderHeader();
        }
    }

    #showButton() {
        let showButton = document.createElement("button");
        showButton.id = "showTreeMap";
        showButton.innerHTML = "Show";
        showButton.onclick = this.#showTreeMap.bind(this); 

        return showButton;
    }

    #showTreeMap() {
        try {
            this.#restructureTable();
            let treeData = new TreeData(this.#filteredTable());
            let chart = new TreeMapChart(this.#chartId, treeData);
        } catch(error) {
            alert(error);
        }
    }

    #activeFilter() {
        let selects = document.querySelectorAll('.member-select');

        let filter = {};
        for(let select of selects) {
            let dimensionName = select.id.match(/(\w+)-\w+/)[1]            
            let members = [];
            let options = Array.from(select.options).filter(o => o.selected);
            for(let option of options) {
                members.push(option.value);
            }
            filter[dimensionName] = members;
        }

        return filter;
    }

    #restructureTable() {
        let dimensions = this.#activeDimensions.concat(this.#dimensionsPool);
        let measure = this.#measures[0];

        let table = {};
        for(let i=0; i<dimensions.length; i++) {
            table[dimensions[i]] = this.#table[dimensions[i]];
        }
        table[measure] = this.#table[measure];

        this.#table = table;
    }

    #filteredTable() {
        let filter = this.#activeFilter();
        let count = this.#rowCount;
        let dimensions = this.dimensions;
        let columns = Object.keys(this.#table);

        let filteredTable = {};
        columns.forEach(c => filteredTable[c] = []);

        for(let i=0; i<count; i++) {

            let recordFiltered = true;

            for(let dimensionName in filter) {
                let columnFiltered = false;
                for(let member of filter[dimensionName]) {
                    if(this.#table[dimensionName][i] == member) {
                        columnFiltered = true;
                        break;
                    }
                }

                recordFiltered = recordFiltered && columnFiltered;
            }

            if(recordFiltered) {
                columns.forEach(d => filteredTable[d].push(this.#table[d][i]));
            }
        }

        return filteredTable;
    }

    #onDimensionDragOver(event) {
        event.preventDefault();
    }

    #onDimensionDragStart(event) {
        if(this.#justOneItemToDrag(event)) {
            event.preventDefault();
        } else {
            event.dataTransfer.setData("text/plain", event.target.innerHTML);
        }
    }

    #justOneItemToDrag(event) {
        if((event.target.parentElement.className === 'dimension-control' && this.#activeDimensions.length == 1) || 
           (event.target.parentElement.id === 'dimensions-pool' && this.#dimensionsPool.length == 1)) {
            return true;
        } else {
            return false;
        }
    }

    #onDimensionDrop(event) {
        let active = this.#activeDimensions;
        let pool = this.#dimensionsPool;
        let dragDimension = event.dataTransfer.getData("text/plain");

        if(active.indexOf(dragDimension) >= 0) { // active dragged and dropped into active

            event.preventDefault();

            let intoDimension = event.target.innerHTML;
            active.splice(active.indexOf(dragDimension), 1);
            active.splice(active.indexOf(intoDimension),0, dragDimension);
            
            this.#renderHeader();

        } else if(pool.indexOf(dragDimension) >= 0) { // pooled dragged and dropped into active

            event.preventDefault();

            let intoDimension = event.target.innerHTML;
            pool.splice(pool.indexOf(dragDimension), 1);
            active.splice(active.indexOf(intoDimension),0, dragDimension);
            
            this.#renderHeader();

        }
    }

    get table() {
        return this.#table;
    }

    get header() {
        return this.#header;
    }

    get chartId() {
        return this.#chartId;
    }
}

export { TreeMapControl };