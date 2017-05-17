import * as spauth from 'node-sp-auth';
import * as nodeFetch from 'node-fetch';
import fetch from 'node-fetch';
import * as https from 'https';
import * as Promise from 'bluebird';
import * as path from 'path';
import * as url from 'url';
import { IAuthOptions } from 'node-sp-auth';
import { AuthConfig } from 'node-sp-auth-config';

declare var global: any;

export interface IAuthConf {
    configPath?: string;
    encryptPassword?: boolean;
    saveConfigOnDisk?: boolean;
}

export interface IPnPNodeSettings {
    siteUrl?: string;
    authOptions?: IAuthOptions;
    config?: IAuthConf;
}

export class PnPNode {

    private settings: IPnPNodeSettings;
    private authConfig: AuthConfig;

    constructor(settings: IPnPNodeSettings = {}) {
        let config = settings.config || {};
        this.settings = {
            ...settings,
            config: {
                ...config,
                configPath: path.resolve(config.configPath || './config/private.json'),
                encryptPassword: typeof config.encryptPassword !== 'undefined' ? config.encryptPassword : true,
                saveConfigOnDisk: typeof config.saveConfigOnDisk !== 'undefined' ? config.saveConfigOnDisk : true
            }
        };
        this.authConfig = new AuthConfig(this.settings.config);
    }

    public init(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (typeof this.settings.authOptions === 'undefined') {
                this.authConfig.getContext()
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

                    /* Attach headers and options received from node-sp-auth */
                    let headers: any = {
                        ...data.headers,
                        'Accept': options.headers._headers.accept[0] || 'application/json;odata=verbose',
                        'Content-Type': options.headers._headers['content-type'][0] || 'application/json;odata=verbose'
                    };
                    let fetchOptions: any = {
                        ...options,
                        ...data.options
                    };
                    fetchOptions.headers = headers;

                    let isHttps: boolean = url.parse(requestUrl).protocol === 'https:';

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
