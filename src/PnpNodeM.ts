import { IHttpClientImpl, IFetchOptions } from '@pnp/common-commonjs';

import { PnpNode } from './PnpNode';
import { Utils } from './utils';

export class PnpNodeM implements IHttpClientImpl {

  private factories: PnpNode[];
  private utils: Utils;

  constructor (...factories: PnpNode[]) {
    this.factories = factories;
    this.utils = new Utils();
  }

  public fetch = (url: string, options: IFetchOptions): Promise<any> => {
    const clientInstance = this.utils.mergeHeaders(options.headers).get('x-clientinstance') || 'default';
    const client = this.factories.find((f) => f.clientInstance === clientInstance);
    if (!client) {
      throw Error(`No fetch client found for client instance '${clientInstance}'.`);
    }
    return client.fetch(url, options);
  }

}
