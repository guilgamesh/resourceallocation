import { DevOpsClient } from '../client/DevOpsClient.js';
import { Organization } from './Organization.js';
import { OrganizationControl } from './OrganizationControl.js';

let client = null;

window.onload = () => {
    createDevOpsClient();
    loadOrganization();
}

function createDevOpsClient() {
    let url = 'http://127.0.0.1:5000/devapi/';
    client = new DevOpsClient(url)
}

function loadOrganization() {
    let parentEmail = 'sukumar.bhasker@flex.com';
    client.getOrganization(parentEmail)
    .then(data => {
        displayOrganization(data);
    })
    .catch(error => {
        console.log(`Error: ${error}`);
    });
}

function displayOrganization(resources) {
    let organization = new Organization(resources);
    let control = new OrganizationControl(organization, 'organization');
}