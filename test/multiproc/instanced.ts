import { sp, Web } from '@pnp/sp-commonjs';
import { AuthConfig } from 'node-sp-auth-config';

import { PnpNodeM, PnpNode } from '../../src';

(async () => {

  const ctx1 = await new AuthConfig({
    configPath: './config/multiproc/private.1.json'
  }).getContext()

  const ctx2 = await new AuthConfig({
    configPath: './config/multiproc/private.2.json'
  }).getContext()

  const pnpFetch1 = new PnpNode({ ...ctx1, clientInstance: 'instance-1' });
  const pnpFetch2 = new PnpNode({ ...ctx2, clientInstance: 'instance-2' });

  const pnpMultiFetch = new PnpNodeM(pnpFetch1, pnpFetch2);

  sp.setup({
    sp: {
      fetchClientFactory: () => pnpMultiFetch
    }
  });

  const web1 = Web(ctx1.siteUrl).configure({
    headers: { 'X-ClientInstance': 'instance-1' }
  });

  const web2 = Web(ctx2.siteUrl).configure({
    headers: { 'X-ClientInstance': 'instance-2' }
  });

  const [ u1, u2 ] = await Promise.all([
    web1.currentUser.select('Title').get(),
    web2.currentUser.select('Title').get()
  ]);

  console.log({ u1, u2 });
  console.log('Done');

})()
  .catch(console.warn);
