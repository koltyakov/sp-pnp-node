# sp-pnp-node - PnPjs's auth client factory for Node.js

[![NPM](https://nodei.co/npm/sp-pnp-node.png?mini=true&downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/sp-pnp-node/)

[![npm version](https://badge.fury.io/js/sp-pnp-node.svg)](https://badge.fury.io/js/sp-pnp-node)
[![Downloads](https://img.shields.io/npm/dm/sp-pnp-node.svg)](https://www.npmjs.com/package/sp-pnp-node)
![Gitter chat](https://badges.gitter.im/gitterHQ/gitter.png)

> Consider using [pnp-auth](https://github.com/SharePoint-NodeJS/pnp-auth) as a successor which soaked the best of `sp-pnp-node` and `node-pnp-sp` libraries. I'm keeping `sp-pnp-node` not archived and update it from time to time only because of some production implementations which I'm too lazy to migrate to `pnp-auth` right away.

`sp-pnp-node` provides a simple way for using [`PnPjs`](https://github.com/pnp/pnpjs) in Node.js with support of various authentication strategies.

## About PnPjs

PnPjs Client Side Libraries for Microsoft 365 was created to help developers by simplifying common operations within SharePoint and the SharePoint Framework. Currently it contains a fluent API for working with the full SharePoint REST API as well as utility and helper functions. This takes the guess work out of creating REST requests, letting developers focus on the what and less on the how.

## Supported SharePoint versions

- SharePoint Online
- SharePoint 2013
- SharePoint 2016
- SharePoint 2019

## Install

### NPM

```bash
npm install sp-pnp-node @pnp/pnpjs --save
```

### Yarn

```bash
yarn add sp-pnp-node @pnp/pnpjs
```

## Usage examples

### Minimal setup

Can be as simple as 5 lines of code:

```typescript
import { Web } from '@pnp/sp';
import { PnpNode } from 'sp-pnp-node';

new PnpNode().init().then(settings => {

  const web = new Web(settings.siteUrl);
  /// ... // <<< Here goes PnP JS Core code

}).catch(console.log);
```

![demo](https://raw.githubusercontent.com/koltyakov/sp-pnp-node/master/docs/demo.gif)

`sp-pnp-node` has two modes:

- ambient init - wraps `PnPjs` with promise based auth wizard helper
- factory - `fetchClientFactory` implementation

_When to use ambient init_: in scripts with user interaction involved when there is no information about authentication and target invironment before script is executed. SharePoint url and the creds are prompted in a console.

In CI/CD scenarios, factory approach is recommended over interactive console as it can lead to a task stuck.

### TypeScript

#### Ambient init example

```typescript
import { Web } from '@pnp/sp';
import { PnpNode, IPnpNodeSettings } from 'sp-pnp-node';

const optionalInitSettings: IPnpNodeSettings = {
  // ...
};

new PnpNode(optionalInitSettings).init().then((settings: IPnpNodeSettings) => {

  // Here goes PnP JS Core code >>>

  const web = new Web(settings.siteUrl);
  // Any SPWeb url can be used for `new Web(...)`
  // not necessarily which is provided in `optionalInitSettings`

  // Get all list example
  web.lists.get()
    .then(lists => {
      console.log(lists.map(list => list.Title));
    })
    .catch(console.log);

  // <<< Here goes PnP JS Core code

}).catch(console.log);
```

#### Factory example

```typescript
import * as pnp from '@pnp/sp';
import { PnpNode, IPnpNodeSettings } from 'sp-pnp-node';

const config = require('../config/private.json');

const pnpNodeSettings: IPnpNodeSettings = {
  // siteUrl - Optional if baseUrl is in pnp.setup or in case of `new Web(url)`
  siteUrl: config.siteUrl,
  authOptions: config
};

pnp.sp.setup({
  sp: {
    fetchClientFactory: () => new PnpNode(pnpNodeSettings),
    // baseUrl - Optional if siteUrl is in IPnpNodeSettings or in case of `new Web(url)`
    baseUrl: config.siteUrl
  }
});

pnp.sp.web.get()
  .then(console.log)
  .catch(console.log);

// Or

/*
new Web('http://adhoc.url/sites/site').get()
  .then(console.log)
  .catch(console.log);
*/
```

### JavaScript

```javascript
const { Web } = require('@pnp/sp');
const { PnpNode } = require('sp-pnp-node');

new PnpNode().init().then(settings => {

  // Here goes PnP JS Core code >>>

  const web = new Web(settings.siteUrl);

  // Get all content types example
  web.contentTypes.get()
    .then(cts => {
      console.log(cts.map(ct => {
        return {
          name: ct.Name,
          description: ct.Description
        };
      }));
    })
    .catch(console.log);

  // <<< Here goes PnP JS Core code

}).catch(console.log);
```

### OData Metadata modes

```typescript
import { sp } from '@pnp/sp';
import { PnpNode, IPnpNodeSettings } from 'sp-pnp-node';

new PnpNode().init().then((settings: IPnpNodeSettings) => {

  sp.setup({
    sp: {
      headers: {
        // 'Accept': 'application/json;odata=verbose'
        'Accept': 'application/json;odata=minimalmetadata'
        // 'Accept': 'application/json;odata=nometadata'
      }
    }
  });

  // ...

}).catch(console.log);
```

## Initiation settings

```typescript
import { PnpNode } from 'sp-pnp-node';

const pnpNodeSettings: IPnpNodeSettings = {
  /// ...
};

new PnpNode(pnpNodeSettings).init().then(settings => {

  // Here goes PnP JS Core code

}).catch(console.log);
```

### Raw Fetch client usage

```typescript
import { PnpNode } from 'sp-pnp-node';

declare const global: any;

new PnpNode().init().then(settings => {

  // Any raw RESP API requests with Fetch client
  global.fetch(`${settings.siteUrl}/_api/web`, {
    method: 'GET',
    headers: {
      accept: 'application/json;odata=minimalmetadata'
    }
  })
    .then(response => response.json())
    .then(console.log)
    .catch(console.log);

});

```

### PnP Node Settings options

- siteUrl?: string; // Optional SPWeb url
- authOptions?: IAuthOptions; `node-sp-auth` [credentials options](https://github.com/s-KaiNet/node-sp-auth)
- config?: IAuthConf; `node-sp-auth-config` [options](https://github.com/koltyakov/node-sp-auth-config)
  - configPath?: string; // Path to auth config .json | Default is './config/private.json'
  - encryptPassword?: boolean; // Encrypts password to a machine-bind hash | Default is 'true'
  - saveConfigOnDisk?: boolean; // Saves config .json to disk | Default is 'true'

Settings can be left blank. Auth options in such a case will be asked by `node-sp-auth-config` [options](https://github.com/koltyakov/node-sp-auth-config) in a wizard like approach.

### Settings scenarios

- No initial settings (defaults): wizard approach, covers console applications cases with user interaction
- With explicitly defined `authOptions`:
  - external tools is in charge for preparing auth credentials in `node-sp-auth` format
  - credentials should not be dumped on disc
- Config file with prepopulated credentials: schedule, job automation, continues integration

## Supported authentication scenarios

- SharePoint On-Premise (2013, 2016):
  - User credentials (NTLM)
  - Form-based authentication (FBA)
  - Add-In Only permissions
  - ADFS user credentials

- SharePoint Online:
  - User credentials (SAML)
  - Add-In Only permissions
  - ADFS user credentials

## Inspiration and references

This project was inspired by [Sergei Sergeev](https://github.com/s-KaiNet) and [Patrick Rodgers](https://github.com/patrick-rodgers). Main ideas were taken from [node-pnpjs-sample](https://github.com/s-KaiNet/node-pnpjs-sample) and [Using PnP JS Core and node-sp-auth](https://blogs.msdn.microsoft.com/patrickrodgers/2016/10/17/using-pnp-js-core-and-node-sp-auth/). The result project implements the same concepts with a goal of reusability and maintenance simplification.
