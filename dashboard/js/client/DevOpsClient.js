import { RESTClient } from '../client/RestClient.js';

class DevOpsClient extends RESTClient {
    
    constructor(url) {
        super(url);
    }

    async getOrganization(parentEmail) {
        return this.sendRequest(`organization/${parentEmail}`);
    }
}

export { DevOpsClient };