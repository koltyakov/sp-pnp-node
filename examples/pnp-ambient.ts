import { Web, sp } from '@pnp/sp';
import { PnpNode, IPnpNodeSettings } from '../src';

const pnpNodeSettings: IPnpNodeSettings = {
  // ...
};

const pnpNode = new PnpNode(pnpNodeSettings);

pnpNode.init().then((settings: IPnpNodeSettings) => {

  const web: Web = new Web(settings.siteUrl);

  sp.setup({
    sp: {
      headers: {
        'Accept': 'application/json;odata=nometadata'
      }
    }
  });

  return web.get().then(console.log);

}).catch(console.log);
