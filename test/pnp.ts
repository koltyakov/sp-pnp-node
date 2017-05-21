import { Web, setup as pnpsetup } from 'sp-pnp-js';
import { PnpNode, IPnpNodeSettings } from '../src';

let pnpNodeSettings: IPnpNodeSettings = {
    // ...
};

const pnpNode = new PnpNode(pnpNodeSettings);

pnpNode.init().then((settings: IPnpNodeSettings) => {

    let web: Web = new Web(settings.siteUrl);

    pnpsetup({
        headers: {
            'Accept': 'application/json;odata=nometadata'
        }
    });

    web.get().then(resp => {
        console.log(resp);
    });

}).catch(console.log);
