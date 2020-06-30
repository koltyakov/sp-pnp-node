import { IHttpClientImpl, IFetchOptions } from '@pnp/common-commonjs';
import * as spauth from 'node-sp-auth';
import * as nodeFetch from 'node-fetch';
// tslint:disable-next-line:no-duplicate-imports
import fetch from 'node-fetch';
import * as https from 'https';
import * as path from 'path';
import { Cpass } from 'cpass';
import { AuthConfig as SPAuthConfigirator } from 'node-sp-auth-config';
import * as crc from 'crc-32';

import { Utils } from './utils';
import { IPnpNodeSettings } from './IPnpNode';

declare let global: any;

global.Headers = nodeFetch.Headers;
global.Request = nodeFetch.Request;
global.Response = nodeFetch.Response;

export class PnpNode implements IHttpClientImpl {

  private settings: IPnpNodeSettings;
  private spAuthConfigirator: SPAuthConfigirator;
  private agent: https.Agent;
  private utils: Utils;

  constructor (settings: IPnpNodeSettings = {}) {
    const config = settings.config || {};
    this.settings = {
      ...settings,
      config: {
        ...config,
        configPath: path.resolve(config.configPath || path.join(process.cwd(), 'config/private.json')),
        encryptPassword: typeof config.encryptPassword !== 'undefined' ? config.encryptPassword : true,
        saveConfigOnDisk: typeof config.saveConfigOnDisk !== 'undefined' ? config.saveConfigOnDisk : true
      },
      envCode: settings.envCode || '15'
    };
    if (typeof this.settings.authOptions !== 'undefined') {
      const cpass = new Cpass();
      (this.settings.authOptions as any).password = (this.settings.authOptions as any).password &&
        cpass.decode((this.settings.authOptions as any).password);
    }
    this.utils = new Utils();
    this.spAuthConfigirator = new SPAuthConfigirator(this.settings.config);
    this.agent = new https.Agent(settings.httpsAgentOptions || {
      rejectUnauthorized: false,
      keepAlive: true,
      keepAliveMsecs: 10000
    });
    global.fetch = this.fetch;
  }

  public fetch = (url: string, options: IFetchOptions): Promise<any> => {
    if (!this.utils.isUrlAbsolute(url)) {
      if (this.settings.siteUrl) {
        url = this.utils.combineUrl(this.settings.siteUrl, url);
      } else {
        throw new Error('siteUrl is not defined.');
      }
    }

    // Authenticate with node-sp-auth and inject auth headers
    return spauth.getAuth(url, this.settings.authOptions).then((data: any) => {
      // Merge options and headers
      const fetchOptions: any = {
        ...options,
        ...data.options,
        headers: this.utils.mergeHeaders({
          'Accept': 'application/json;odata=verbose',
          'Content-Type': 'application/json;odata=verbose'
        }, options.headers, data.headers)
      };

      // On-Prem 2013 issue with `accept: application/json`
      if (this.utils.isOnPrem(url) && this.settings.envCode === '15') {
        const disallowed = ['application/json'];
        if (disallowed.indexOf(fetchOptions.headers.get('accept')) !== -1) {
          fetchOptions.headers.set('accept', 'application/json;odata=verbose');
        }
      }

      if (this.utils.isUrlHttps(url) && !fetchOptions.agent) {
        // Bypassing ssl certificate errors (self signed, etc) for on-premise
        fetchOptions.agent = this.agent;
      }

      const authOptions: any = this.settings.authOptions as any || { empty: true };
      const authClientId = authOptions.username || authOptions.clientId || 'unknown';
      const authCredsHash = authOptions.empty ? 'empty' : crc.str(JSON.stringify(authOptions)).toString(16);

      if (this.settings.fetchSpy && this.settings.fetchSpy.beforeRequest) {
        this.settings.fetchSpy.beforeRequest(url, fetchOptions, authClientId, authCredsHash);
      }

      // Return actual request promise
      return fetch(url, fetchOptions);

    });
  }

  public init = (): Promise<IPnpNodeSettings> => {
    return new Promise((resolve, reject) => {
      if (typeof this.settings.authOptions === 'undefined') {
        this.spAuthConfigirator.getContext()
          .then((context) => {
            this.settings = {
              ...this.settings,
              ...context as any
            };
            resolve(this.settings);
          })
          .catch(reject);
      } else {
        resolve(this.settings);
      }
    });
  }

}
