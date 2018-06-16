import { sp } from '@pnp/sp';
import { PnpNode, IPnpNodeSettings } from '../src';

let config = require('../config/private.json');

let pnpNodeSettings: IPnpNodeSettings = {
  siteUrl: config.siteUrl, // Optional if baseUrl is in pnp.setup or in case of `new Web(url)`
  authOptions: config
};

sp.setup({
  sp: {
    fetchClientFactory: () => {
      return new PnpNode(pnpNodeSettings);
    },
    baseUrl: config.siteUrl // Optional if siteUrl is in IPnpNodeSettings or in case of `new Web(url)`
  }
});

sp.web.get()
  .then(console.log)
  .catch(console.log);
