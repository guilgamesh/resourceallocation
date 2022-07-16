class RESTClient {
    
    #url;

    constructor(url) {
        this.#url = url;
    }

    async sendRequest(suffix, method=null, data=null) {
        let url = `${this.#url}${suffix}`;

        const response = await fetch(url, {
            method: method==null ? 'GET' : method,
            headers: {
                'Content-Type': 'application/json'
            },
            mode: 'cors',
            body: data === null ? null : JSON.stringify(data)
        });

        return response.json();
    }
}

export { RESTClient };