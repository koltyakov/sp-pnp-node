import * as mocha from 'mocha';
import { expect } from 'chai';
import { sp, Web } from '@pnp/sp';
import * as sprequest from 'sp-request';
import { Cpass } from 'cpass';
import { IAuthContext } from 'node-sp-auth-config';

import { PnpNode, IPnpNodeSettings } from '../../src';

import { Environments } from '../configs';
import { getAuthCtx } from './misc';

const cpass = new Cpass();

const testVariables = {
  newListName: 'PnP JS Core Temporary List'
};

for (const testConfig of Environments) {

  describe(`Run tests in ${testConfig.environmentName}`, () => {

    let request: sprequest.ISPRequest;
    let config: IAuthContext;

    before('Configure PnP for Node.js', function (done: Mocha.Done): void {
      this.timeout(30 * 1000);

      getAuthCtx(testConfig)
        .then((ctx) => {
          config = ctx;

          const pnpNodeSettings: IPnpNodeSettings = {
            ...config,
            httpsAgentOptions: {
              rejectUnauthorized: false,
              keepAlive: true,
              keepAliveMsecs: 10000
            }
          };

          const fetchClient = new PnpNode(pnpNodeSettings);
          sp.setup({
            sp: {
              fetchClientFactory: () => fetchClient
              // baseUrl: config.siteUrl
            }
          });

          const password = (config.authOptions as any).password && cpass.decode((config.authOptions as any).password);
          request = sprequest.create({ ...config.authOptions, password });

          done();
        })
        .catch(done);
    });

    it(`should get web's title`, function (done: Mocha.Done): void {
      this.timeout(30 * 1000);

      request.get(`${config.siteUrl}/_api/web?$select=Title`)
        .then(response => {
          return Promise.all([
            sp.web.select('Title').get(),
            response.body.d.Title
          ]);
        })
        .then(response => {
          expect(response[0].Title).to.equal(response[1]);
          done();
        })
        .catch(done);
    });

    it(`should get lists on web`, function (done: Mocha.Done): void {
      this.timeout(30 * 1000);

      request.get(`${config.siteUrl}/_api/web/lists?$select=Title`)
        .then(response => {
          return Promise.all([
            sp.web.lists.select('Title').get(),
            response.body.d.results
          ]);
        })
        .then(response => {
          expect(response[0].length).to.equal(response[1].length);
          done();
        })
        .catch(done);
    });

    it('should create a new list', function (done: Mocha.Done): void {
      this.timeout(30 * 1000);

      const web = new Web(config.siteUrl);
      web.lists.add(testVariables.newListName, 'This list was created for test purposes', 100)
        .then(_ => {
          return sp.web.lists.getByTitle(testVariables.newListName).select('Title').get();
        })
        .then(response => {
          expect(response.Title).to.equal(testVariables.newListName);
          done();
        })
        .catch(done);
    });

    it('should create list item', function (done: Mocha.Done): void {
      this.timeout(30 * 1000);

      const web = new Web(config.siteUrl);
      const list = web.lists.getByTitle(testVariables.newListName);
      list.items.add({ Title: 'New item' })
        .then(_ => {
          return list.items.select('Title').get();
        })
        .then(_ => {
          done();
        })
        .catch(done);
    });

    it('should delete list item', function (done: Mocha.Done): void {
      this.timeout(30 * 1000);

      const web = new Web(config.siteUrl);
      const list = web.lists.getByTitle(testVariables.newListName);
      list.items.select('Id').top(1).get()
        .then(response => {
          return list.items.getById(response[0].Id).delete();
        })
        .then(_ => {
          done();
        })
        .catch(done);
    });

    // SharePoint Online and On-Premise 2016 only
    if (!testConfig.legacy) {

      it(`should fetch minimalmetadata`, function (done: Mocha.Done): void {
        this.timeout(30 * 1000);

        sp.setup({
          sp: {
            headers: {
              accept: 'application/json;odata=minimalmetadata'
            }
          }
        });

        const web = new Web(config.siteUrl);
        web.get()
          .then(response => {
            sp.setup({
              sp: {
                headers: undefined
              }
            });
            expect(response).to.have.property('odata.metadata');
            expect(response).to.not.have.property('__metadata');
            done();
          })
          .catch(done);

      });

      it(`should fetch nometadata`, function (done: Mocha.Done): void {
        this.timeout(30 * 1000);

        sp.setup({
          sp: {
            headers: {
              accept: 'application/json;odata=nometadata'
            }
          }
        });

        const web = new Web(config.siteUrl);
        web.get()
          .then(response => {
            sp.setup({
              sp: {
                headers: undefined
              }
            });
            expect(response).to.have.property('Id');
            expect(response).to.not.have.property('odata.metadata');
            expect(response).to.not.have.property('__metadata');
            done();
          })
          .catch(done);

      });

      it('should create list items in batch', function (done: Mocha.Done): void {
        this.timeout(30 * 1000);

        const dragons = ['Jineoss', 'Zyna', 'Bothir', 'Jummerth', 'Irgonth', 'Kilbiag',
          'Berget', 'Lord', 'Podocrurth', 'Jiembyntet', 'Rilrayrarth'];

        const web = new Web(config.siteUrl);
        const list = web.lists.getByTitle(testVariables.newListName);

        const batch = web.createBatch();

        dragons.forEach(dragon => {
          list.items.inBatch(batch).add({ Title: dragon });
        });

        batch.execute()
          .then(() => {
            done();
          })
          .catch(done);
      });

      it('should delete list items in batch', function (done: Mocha.Done): void {
        this.timeout(30 * 1000);

        const web = new Web(config.siteUrl);
        const list = web.lists.getByTitle(testVariables.newListName);

        list.items.select('Id').get()
          .then(response => {
            let batch = web.createBatch();

            response.forEach(item => {
              list.items.inBatch(batch).getById(item.Id).delete();
            });

            return batch.execute();
          })
          .then(_ => {
            done();
          })
          .catch(done);

      });

    }

    /*
    // DigestCache issue
    it('should create a new list', function(done: Mocha.Done): void {
        this.timeout(30 * 1000);

        sp.web.lists.add(testVariables.newListName, 'This list was created for test purposes', 100)
            .then(response => {
                return sp.web.lists.getByTitle(testVariables.newListName).select('Title').get();
            })
            .then(response => {
                expect(response.Title).to.equal(testVariables.newListName);
                done();
            })
            .catch(done);
    });
    */

    it('should correctly consume baseUrl setting', function (done: Mocha.Done): void {
      this.timeout(30 * 1000);

      sp.setup({
        sp: {
          baseUrl: config.siteUrl
        }
      });

      request.get(`${config.siteUrl}/_api/web?$select=Title`)
        .then(response => {
          return Promise.all([
            sp.web.select('Title').get(),
            response.body.d.Title
          ]);
        })
        .then(response => {
          expect(response[0].Title).to.equal(response[1]);

          sp.setup({
            sp: {
              baseUrl: undefined
            }
          });

          done();
        })
        .catch(done);
    });

    after('Deleting test objects', function (done: Mocha.Done): void {
      this.timeout(30 * 1000);

      let digest: string;
      request.requestDigest(config.siteUrl)
        .then(response => {
          digest = response;
          return request.get(`${config.siteUrl}/_api/web/lists/getByTitle('${testVariables.newListName}')`)
            .then(_ => {
              return 'can delete';
            })
            .catch(ex => {
              if (ex.statusCode === 404) {
                return ''; // Do not try to delete if wasn't created
              } else {
                throw ex;
              }
            });
        })
        .then((response): any => {
          if (response === 'can delete') {
            // Delete created test list
            return request.post(`${config.siteUrl}/_api/web/lists/getByTitle('${testVariables.newListName}')`, {
              headers: {
                'X-RequestDigest': digest,
                'X-HTTP-Method': 'DELETE',
                'IF-MATCH': '*'
              }
            });
          } else {
            return '';
          }
        })
        .then(() => {
          done();
        })
        .catch(done);

    });

  });

}
