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

### TypeScript

```javascript
import { PnPNode } from 'sp-pnp-node';
import { Web } from 'sp-pnp-js';

const pnpNode = new PnPNode();

pnpNode.init().then((settings) => {

    // Here goes PnP JS Core code
    let web = new Web(settings.siteUrl);
    web.get().then(console.log);

});
```

### JavaScript

```javascript
const PnPNode = require('sp-pnp-node').PnPNode;
const pnp = require('sp-pnp-js');

const pnpNode = new PnPNode();

pnpNode.init().then((settings) => {

    // Here goes PnP JS Core code
    let web = new pnp.Web(settings.siteUrl);
    web.get().then(console.log);

});
```

## Initiation settings

```javascript
new PnPNode(settings: IPnPNodeSettings);
```

### PnP Node Settings (IPnPNodeSettings) options:

- siteUrl?: string;
- authOptions?: IAuthOptions; `node-sp-auth` [credentials options](https://github.com/s-KaiNet/node-sp-auth)
- config?: IAuthConf; `node-sp-auth-config` [options](https://github.com/koltyakov/node-sp-auth-config)
  - configPath?: string; // Path to auth config .json | Default is './config/private.json'
  - encryptPassword?: boolean; // Encrypt password to a machine-bind hash | Default is 'true'
  - saveConfigOnDisk?: boolean; // Save config .json to disk | Default is 'true'

Settings can be left blank. Auth options in such a case will be asked by `node-sp-auth-config` [options](https://github.com/koltyakov/node-sp-auth-config) in a wizard like approach.

## Inspiration and references

This project was inspired by [Sergei Sergeev](https://github.com/s-KaiNet) and [Patrick Rodgers](https://github.com/patrick-rodgers). Main ideas were taken from [node-pnpjs-sample](https://github.com/s-KaiNet/node-pnpjs-sample) and [Using PnP JS Core and node-sp-auth](https://blogs.msdn.microsoft.com/patrickrodgers/2016/10/17/using-pnp-js-core-and-node-sp-auth/). The result project implements the same concepts with a goal of reusability and maintenance simplification.