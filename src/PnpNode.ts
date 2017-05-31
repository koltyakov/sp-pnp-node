import { HttpClientImpl, FetchOptions } from 'sp-pnp-js';
import * as spauth from 'node-sp-auth';
import * as nodeFetch from 'node-fetch';
import fetch from 'node-fetch';
import * as https from 'https';
import * as path from 'path';
import { Cpass } from 'cpass';

import { IAuthOptions } from 'node-sp-auth';
import { AuthConfig as SPAuthConfigirator } from 'node-sp-auth-config';

import { Utils } from './utils';
import { IPnpNodeSettings } from './interfaces';

declare var global: any;

global.Headers = nodeFetch.Headers;
global.Request = nodeFetch.Request;
global.Response = nodeFetch.Response;

export class PnpNode implements HttpClientImpl {

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
        if (typeof this.settings.authOptions !== 'undefined') {
            const cpass = new Cpass();
            (this.settings.authOptions as any).password = (this.settings.authOptions as any).password &&
                cpass.decode((this.settings.authOptions as any).password);
        }
        this.utils = new Utils();
        this.spAuthConfigirator = new SPAuthConfigirator(this.settings.config);
    }

    public fetch = (url: string, options: FetchOptions): Promise<any> => {
        if (!this.utils.isUrlAbsolute(url)) {
            url = this.utils.combineUrl(this.settings.siteUrl, url);
        }

        // if (options.method === 'POST') {
        //     console.log(
        //         url, options.method,
        //         this.utils.anyToHeaders(options.headers).get('x-requestdigest')
        //     );
        // }

        // Authenticate with node-sp-auth and inject auth headers
        return <any>spauth.getAuth(url, this.settings.authOptions)
            .then((data: any) => {

                // Merge options and headers
                let fetchOptions: any = {
                    ...options,
                    ...data.options,
                    headers: this.utils.mergeHeaders({
                        'Accept': 'application/json;odata=verbose',
                        'Content-Type': 'application/json;odata=verbose'
                    }, options.headers, data.headers)
                };

                // On-Prem 2013 issue with `accept: application/json`
                // On-Prem 2016 is sacrificed to be treaten as 2013 for now
                if (this.utils.isOnPrem(url)) {
                    const disallowed = [ 'application/json' ];
                    if (disallowed.indexOf(fetchOptions.headers.get('accept')) !== -1) {
                        fetchOptions.headers.set('accept', 'application/json;odata=verbose');
                    }
                }

                if (this.utils.isUrlHttps(url) && !fetchOptions.agent) {
                    // Bypassing ssl certificate errors (self signed, etc) for on-premise
                    fetchOptions.agent = new https.Agent({ rejectUnauthorized: false });
                }

                // Return actual request promise
                return fetch(url, fetchOptions);
            });
    }

    public init = (): Promise<IPnpNodeSettings> => { return this.initAmbient(); }; // Alias
    public initAmbient = (): Promise<IPnpNodeSettings> => {
        global.fetch = this.fetch;
        return new Promise((resolve, reject) => {
            if (typeof this.settings.authOptions === 'undefined') {
                this.spAuthConfigirator.getContext()
                    .then((context) => {
                        this.settings = {
                            ...this.settings,
                            ...context
                        };
                        resolve(this.settings);
                    })
                    .catch((error: any) => {
                        reject(error);
                    });
            } else {
                resolve(this.settings);
            }
        });
    }

}
