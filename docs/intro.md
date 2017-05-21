# Using PnP JS Core outside a browser (Node.js environment)

> Expanding scopes of usage of favorite tools

I [wrote](https://www.linkedin.com/pulse/sharepoint-pnp-javascript-core-components-deserve-more-koltyakov) about [PnP JS Core](https://github.com/SharePoint/PnP-JS-Core) 9 month ago. In those post, I shared my experience of first steps with the library and decision to give it a shot on the projects.

And what can I say after these months? Now it's one of the must have dependencies on any new front-end project I scaffold for SharePoint. I almost have forgotten when I needed to grab old fellow JSOM (sp.js) for the reason of communication with SharePoint API within a UI application. It works almost for anything available in REST API. There are some gaps and scenarios in the API when REST have no existing methods implementation ([Manage Metadata](https://github.com/SharePoint/PnP-JS-Core/issues/415), some areas of [User Profiles Services](https://www.linkedin.com/pulse/working-sharepoint-ups-nodejs-andrew-koltyakov), [indexed properties](https://github.com/SharePoint/PnP-JS-Core/issues/455), etc.) though it's not something which you need very often in UI application. For the methods, what are there in the REST API, PnP JS Core is an awesome shiny tool.

With time, I faced a couple of project needs where I got to fetch some metadata and data within Node.js using REST where hands themselves started writing in PnP JS Core. Yes, I know that it's not a big deal to prepare REST endpoint URIs and some JSON packages for such tasks. But it's a question of reusability and convenience writing code using your favorite API wrapper.

Luckily, I was not along with such an idea and some folks already [experimented](https://blogs.msdn.microsoft.com/patrickrodgers/2016/10/17/using-pnp-js-core-and-node-sp-auth/) with it and even created [examples](https://github.com/s-KaiNet/node-pnpjs-sample) on GitHub. It was a matter of minutes to grab those concepts and successfully run PnP JS Core in Node.js on the server side.

The suggested method with "patching" global variables, request headers and fetch client worked perfectly on a production for a couple of different things, one of which is extracting metadata for almost 20 hundred different SharePoint artifact elements.

Month later, I faced a need to reuse the technique and not just once but for a number of times.

Well, it was a perfect time to wrap fetch client patching code into some reusable way and avoid copy & pasting between the projects. Said and done. I created a library named [sp-pnp-node](https://github.com/koltyakov/sp-pnp-node), which abstracts away any http request patching experience and allows minify extra code.

One can install dependency with NPM or Yarn:

**NPM**

```bash
npm install sp-pnp-node --save
```

**Yarn**

```bash
yarn add sp-pnp-node --save
```

Then start using it in server side JavaScript or TypeScript.

**Usage in TypeScript**

```javascript
import { PnpNode } from 'sp-pnp-node';
import { Web } from 'sp-pnp-js';

(new PnpNode()).init().then((settings) => {

    // Here goes PnP JS Core code
    let web: Web = new Web(settings.siteUrl);
    // ... do whatever you like with PnP JS Core

});
```

**Usage in ES6**

```javascript
const PnpNode = require('sp-pnp-node').PnPNode;
const pnp = require('sp-pnp-js');

(new PnpNode()).init().then((settings) => {

    // Here goes PnP JS Core code
    let web = new pnp.Web(settings.siteUrl);
    // ... do whatever you like with PnP JS Core

});
```

Three additional lines of code and you are in ready PnP JS Core'ing.

It's possible to define some extra settings, yet my number one idea was to make it as simple to use as possible. So, a new object instance of `PnPNode` can be created with a default settings by providing no configuration parameters in the code at all. What does that mean? How does the lib understand which environment and credentials to use? It will ask for authentication options in a wizard like way and will dump the inputs to a config file, it will even hash your password so it will not be there as a plain text unless you need it to.

Those who familiar with some other projects of myself knows I use `node-sp-auth` heavily for authentication in SharePoint when dealing with Node.js. To share similar user experience with auth configuration [node-sp-auth-config](https://github.com/koltyakov/node-sp-auth-config) was integrated to this lib too. That is `node-sp-auth-config` in charge for asking and saving these settings.

## Conclusion

Once again, I recommend PnP JS Core for the stuff it was designed for. Nine months of constant usage of the library is a strong argument.

Browser is not the only home for PnP JS Core and with tools like [sp-pnp-node](https://github.com/koltyakov/sp-pnp-node) it can be smoothly executed in Node.js (console apps, timer jobs, microservices, electron apps, all of these are benevolent to it).