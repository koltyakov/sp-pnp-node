import * as pnp from 'sp-pnp-js';
import { PnpNode, IPnpNodeSettings } from '../src';

let config = require('../config/private.json');

let pnpNodeSettings: IPnpNodeSettings = {
    siteUrl: config.siteUrl, // Optional if baseUrl is in pnp.setup or in case of `new Web(url)`
    authOptions: config
};

pnp.setup({
    fetchClientFactory: () => {
        return new PnpNode(pnpNodeSettings);
    },
    baseUrl: config.siteUrl // Optional if siteUrl is in IPnpNodeSettings or in case of `new Web(url)`
});

pnp.sp.web.get()
    .then(resp => {
        console.log(resp);
    })
    .catch(console.log);
