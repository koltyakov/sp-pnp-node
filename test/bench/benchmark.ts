import { sp } from '@pnp/sp';
import { PnpNode, IPnpNodeSettings } from '../../src';

(async () => {

  const config = require('../config/integration/private.2016.json');

  const pnpNodeSettings: IPnpNodeSettings = {
    siteUrl: config.siteUrl,
    authOptions: config
  };

  const fetchClient = new PnpNode(pnpNodeSettings);
  sp.setup({
    sp: {
      fetchClientFactory: () => fetchClient,
      baseUrl: config.siteUrl
    }
  });

  console.time('Initial_auth_call');
  await sp.web.select('Id').get().then(() => { /**/ });
  console.timeEnd('Initial_auth_call');

  console.time('Get_web_title');
  await sp.web.select('Title').get().then(() => { /**/ });
  console.timeEnd('Get_web_title');

  console.time('Get_web_props');
  await sp.web.get().then(() => { /**/ });
  console.timeEnd('Get_web_props');

  console.time('Get_users');
  await sp.web.siteUsers.get().then(() => { /**/ });
  console.timeEnd('Get_users');

  console.time('Get_lists');
  await sp.web.lists.get().then(() => { /**/ });
  console.timeEnd('Get_lists');

  console.time('Add_list');
  await sp.web.lists.add('TEST_LIST').then(() => { /**/ });
  console.timeEnd('Add_list');

  console.time('Delete_list');
  await sp.web.lists.getByTitle('TEST_LIST').delete().then(() => { /**/ });
  console.timeEnd('Delete_list');

})()
  .catch(console.log);
