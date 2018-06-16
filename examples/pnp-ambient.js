const pnp = require('sp-pnp-js');
const PnpNode = require('../dist').PnpNode;

const pnpNode = new PnpNode();

pnpNode.init().then((settings) => {

  const web = new pnp.Web(settings.siteUrl);

  pnp.setup({
    sp: {
      headers: {
        Accept: 'application/json;odata=minimalmetadata'
      }
    }
  });

  return web.get().then(console.log);

}).catch(console.log);
