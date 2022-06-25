class TreeMapChart {

    #treeData;

    constructor(id, treeData) {
        this.#treeData = treeData;

        let data = [{
            type: "treemap",
            labels: this.#treeData.labels(),
            ids: this.#treeData.ids(),
            values: this.#treeData.measurements(),
            parents: this.#treeData.parents(),
            branchvalues: "total"
        }]

        let layout = { 
            title: '',
            font: {size: 15}
        };
        
        Plotly.newPlot(id, data, layout);
    }
}

export { TreeMapChart };