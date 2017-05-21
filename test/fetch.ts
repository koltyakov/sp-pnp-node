import { PnpNode } from '../src';

declare const global: any;

(new PnpNode()).init().then((settings) => {

    global.fetch(`${settings.siteUrl}/_api/web`, {
        method: 'GET',
        headers: {
            accept: 'application/json;odata=minimalmetadata'
        }
    })
        .then(response => response.json())
        .then(response => {
            console.log(response);
        })
        .catch(console.log);

});
