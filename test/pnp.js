const pnp = require('sp-pnp-js');
const PnPNode = require('../dist').PnPNode;

const pnpNode = new PnPNode();

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

});
