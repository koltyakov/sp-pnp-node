const pnp = require('sp-pnp-js');
const PnpNode = require('../dist').PnpNode;

const pnpNode = new PnpNode();

pnpNode.initAmbient().then((settings) => {

  let web = new pnp.Web(settings.siteUrl);

  pnp.setup({
    sp: {
      headers: {
        Accept: 'application/json;odata=minimalmetadata'
      }
    }
  });

  web.get()
    .then(resp => {
      console.log(resp);
    })
    .catch(console.log);

}).catch(console.log);
