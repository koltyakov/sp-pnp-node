import * as spauth from 'node-sp-auth';
import * as nodeFetch from 'node-fetch';
import fetch from 'node-fetch';
import * as https from 'https';
import * as Promise from 'bluebird';
import * as path from 'path';
import { IAuthOptions } from 'node-sp-auth';
import { AuthConfig as SPAuthConfigirator } from 'node-sp-auth-config';

import { Utils } from './utils';
import { IPnpNodeSettings } from './interfaces';

declare var global: any;

export class PnpNode {

    private settings: IPnpNodeSettings;
    private spAuthConfigirator: SPAuthConfigirator;
    private utils: Utils;

    constructor(settings: IPnpNodeSettings = {}) {
        let config = settings.config || {};
        this.settings = {
            ...settings,
            config: {
                ...config,
                configPath: path.resolve(config.configPath || path.join(process.cwd(), 'config/private.json')),
                encryptPassword: typeof config.encryptPassword !== 'undefined' ? config.encryptPassword : true,
                saveConfigOnDisk: typeof config.saveConfigOnDisk !== 'undefined' ? config.saveConfigOnDisk : true
            }
        };
        this.spAuthConfigirator = new SPAuthConfigirator(this.settings.config);
        this.utils = new Utils();
    }

    public init(): Promise<IPnpNodeSettings> {
        return new Promise((resolve, reject) => {
            if (typeof this.settings.authOptions === 'undefined') {
                this.spAuthConfigirator.getContext()
                    .then((context) => {
                        this.settings = {
                            ...this.settings,
                            ...context
                        };
                        this.patchFetch(context.authOptions);
                        resolve(this.settings);
                    })
                    .catch((error: any) => {
                        reject(error);
                    });
            } else {
                this.patchFetch(this.settings.authOptions);
                resolve(this.settings);
            }
        });
    }

    private patchFetch(creds: IAuthOptions): void {
        global.Headers = nodeFetch.Headers;
        global.Request = nodeFetch.Request;
        global.Response = nodeFetch.Response;
        global.fetch = (requestUrl: string, options: any) => {
            /* First get auth with help of node-sp-auth */
            return spauth.getAuth(requestUrl, creds)
                .then((data: any) => {

                    let accept: string;
                    let contentType: string;

                    if (this.utils.checkNestedProperties(options.headers, '_headers', 'accept')) {
                        accept = options.headers._headers.accept[0];
                    } else {
                        accept = this.utils.getCaseInsensitiveProp(options.headers, 'accept');
                    }

                    if (this.utils.checkNestedProperties(options.headers, '_headers', 'content-type')) {
                        contentType = options.headers._headers['content-type'][0];
                    } else {
                        contentType = this.utils.getCaseInsensitiveProp(options.headers, 'content-type');
                    }

                    /* Attach headers and options received from node-sp-auth */
                    let headers: any = {
                        ...data.headers,
                        'Accept': accept || 'application/json;odata=verbose',
                        'Content-Type': contentType || 'application/json;odata=verbose'
                    };
                    let fetchOptions: any = {
                        ...options,
                        ...data.options
                    };
                    fetchOptions.headers = headers;

                    let isHttps: boolean = requestUrl.split('://')[0].toLowerCase() === 'https';

                    if (isHttps && !fetchOptions.agent) {
                        /* Bypassing ssl certificate errors (self signed, etc) for on-premise */
                        fetchOptions.agent = new https.Agent({
                            rejectUnauthorized: false
                        });
                    }

                    /* Perform actual request with node-fetch */
                    return fetch(requestUrl, fetchOptions);
                });
        };
    }

}

export { IPnpNodeSettings } from './interfaces';
