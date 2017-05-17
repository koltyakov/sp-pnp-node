import { Web, setup as pnpsetup } from 'sp-pnp-js';
import { PnPNode } from '../src';

const pnpNode = new PnPNode();

pnpNode.init().then((settings) => {

    let web: Web = new Web(settings.siteUrl);

    pnpsetup({
        headers: {
            'Accept': 'application/json;odata=nometadata'
        }
    });

    web.get().then(resp => {
        console.log(resp);
    });

});
