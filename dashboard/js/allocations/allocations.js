import { TreeData }         from '../js/allocations/TreeData.js';
import { TreeMapChart }     from '../js/allocations/TreeMapChart.js';
import { TreeMapControl }   from '../js/allocations/TreeMapControl.js';

let ENVIRONMENT = ["PRODUCTION", "DEVELOPMENT"][1];
let ALLOCATIONS_URL = (ENVIRONMENT == "PRODUCTION" ? "http://172.24.112.1:5000/allocations"
                                : "http://127.0.0.1:5000/allocations");

window.onload = () => {
    fetch(ALLOCATIONS_URL)
    .then(response => response.json())
    .then(data => renderTreeMapControl(JSON.parse(data)))
};

function renderTreeMapControl(indexedTable) {
    let arrayTable = convertColumnsToArrays(indexedTable);
    let tmControl  = new TreeMapControl(arrayTable, 'dash-header', 'treeMap');
    console.log(tmControl);
}

function loadChart(table) {
    let cas = convertColumnsToArrays(table);
    let treeData = new TreeData(cas);
    let chart = new TreeMapChart('treeMap', treeData);
    console.log(treeData);
}

function convertColumnsToArrays(data) {
    let cas = {};

    for(let column in data) {
        cas[column] = [];
        for(let i in data[column]) {
            cas[column][i] = data[column][i];
        }
    }

    return cas;
}