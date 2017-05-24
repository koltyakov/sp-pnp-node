# sp-pnp-node - SharePoint JavaScript Core Library (PnP JS Core) wrapper helper for Node.js

[![NPM](https://nodei.co/npm/sp-pnp-node.png?mini=true&downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/sp-pnp-node/)

[![npm version](https://badge.fury.io/js/sp-pnp-node.svg)](https://badge.fury.io/js/sp-pnp-node)
[![Downloads](https://img.shields.io/npm/dm/sp-pnp-node.svg)](https://www.npmjs.com/package/sp-pnp-node)

`sp-pnp-node` provides a simple way for using [`pnp-js-core`](https://github.com/SharePoint/PnP-JS-Core) without a browser context right in Node.js, in other words, on server side.

`sp-pnp-node` patches global variables and fetch client so `pnp-js-core` used to behave as if it were in it's usual environment.

## About: JavaScript Core Library

The Patterns and Practices JavaScript Core Library was created to help developers by simplifying common operations within SharePoint and the SharePoint Framework. Currently it contains a fluent API for working with the full SharePoint REST API as well as utility and helper functions. This takes the guess work out of creating REST requests, letting developers focus on the what and less on the how.

## Supported SharePoint versions:

- SharePoint Online
- SharePoint 2013
- SharePoint 2016

## Get started

### NPM

```bash
npm install sp-pnp-node sp-pnp-js --save
```

### Yarn

```bash
yarn add sp-pnp-node sp-pnp-js --save
```

## Usage examples

`sp-pnp-node` has two modes:
- ambient - wraps `sp-pnp-js` with promise based auth wizard helper
- factory - `fetchClientFactory` implementation

### TypeScript

#### Ambient example

```javascript
import { Web } from 'sp-pnp-js';
import { PnpNode, IPnpNodeSettings } from 'sp-pnp-node';

let optionalInitSettings: IPnpNodeSettings = { 
    // ...
};

(new PnpNode(optionalInitSettings)).init().then((settings: IPnpNodeSettings) => {

    // Here goes PnP JS Core code >>>

    let web = new Web(settings.siteUrl);
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

```javascript
import * as pnp from 'sp-pnp-js';
import { PnpNode, IPnpNodeSettings } from 'sp-pnp-node';

let config = require('../config/private.json');

let pnpNodeSettings: IPnpNodeSettings = {
    // siteUrl - Optional if baseUrl is in pnp.setup or in case of `new Web(url)`
    siteUrl: config.siteUrl,
    authOptions: config
};

pnp.setup({
    fetchClientFactory: () => {
        return new PnpNode(pnpNodeSettings);
    },
    // baseUrl - Optional if siteUrl is in IPnpNodeSettings or in case of `new Web(url)`
    baseUrl: config.siteUrl
});

pnp.sp.web.get()
    .then(resp => {
        console.log(resp);
    })
    .catch(console.log);

// Or

/*
(new pnp.sp.Web('http://adhoc.url/sites/site')).get()
    .then(resp => {
        console.log(resp);
    })
    .catch(console.log);
*/
```

### JavaScript

```javascript
const pnp = require('sp-pnp-js');
const PnpNode = require('sp-pnp-node').PnpNode;

(new PnpNode()).init().then(settings => {

    // Here goes PnP JS Core code >>>

    let web = new pnp.Web(settings.siteUrl);

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

```javascript
import { Web, setup as pnpsetup } from 'sp-pnp-js';
import { PnpNode, IPnpNodeSettings } from 'sp-pnp-node';

(new PnpNode()).init().then((settings: IPnpNodeSettings) => {

    pnpsetup({
        headers: {
            // 'Accept': 'application/json;odata=verbose'
            'Accept': 'application/json;odata=minimalmetadata'
            // 'Accept': 'application/json;odata=nometadata'
        }
    });

    // ...

}).catch(console.log);
```

## Initiation settings

```javascript
import { PnpNode, IPnpNodeSettings } from 'sp-pnp-node';

let pnpNodeSettings: IPnpNodeSettings = {
    /// ...
};

(new PnpNode(pnpNodeSettings)).init().then((settings: IPnpNodeSettings) => {

    // Here goes PnP JS Core code

}).catch(console.log);
```

### Raw Fetch client usage

```javascript
import { PnpNode } from 'sp-pnp-node';

declare const global: any;

(new PnpNode()).init().then((settings) => {

    // Any raw RESP API requests with Fetch client
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

```

### PnP Node Settings options:

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