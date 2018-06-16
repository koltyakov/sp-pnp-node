import { PnpNode } from '../src';

new PnpNode().init().then(settings => {

  return fetch(`${settings.siteUrl}/_api/web`, {
    method: 'GET',
    headers: {
      accept: 'application/json;odata=minimalmetadata'
    }
  })
    .then(response => response.json())
    .then(console.log);

}).catch(console.log);
