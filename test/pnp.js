const pnp = require('sp-pnp-js');
const PnpNode = require('../dist').PnpNode;

const pnpNode = new PnpNode();

pnpNode.init().then((settings) => {

    let web = new pnp.Web(settings.siteUrl);

    pnp.setup({
        headers: {
            'Accept': 'application/json;odata=minimalmetadata'
        }
    });

    web.get().then(resp => {
        console.log(resp);
    });

}).catch(console.log);
