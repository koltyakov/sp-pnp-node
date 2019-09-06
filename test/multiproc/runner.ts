import { sp } from '@pnp/sp';
import { PnpNode } from '../../src/PnpNode';

import { IWorkerTransport } from './index';

process.on('message', async (transport: IWorkerTransport) => {
  try {

    const pnpFetch = new PnpNode({
      ...transport.context,
      fetchSpy: {
        beforeRequest: (url, _opts, clientId, credsHash) => {
          console.log('beforeRequest', { url, clientId, credsHash });
        }
      }
    });

    sp.setup({
      sp: {
        fetchClientFactory: () => pnpFetch
      }
    });

    const { LoginName } = await sp.web.currentUser.get();
    console.log('Data', { LoginName, siteUrl: transport.context.siteUrl });

    process.exit(0); // OK

  } catch (error) {
    console.error('Error', error);
    process.exit(1); // Error
  }
});

// process.on('uncaughtException', (e) => {
//   process.send(process.pid + ': ' + e);
// });
