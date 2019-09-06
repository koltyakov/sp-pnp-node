import * as path from 'path';
import { fork } from 'child_process';
import { AuthConfig, IAuthContext } from 'node-sp-auth-config';

export interface IWorkerTransport {
  context: IAuthContext;
}

export const startWorkflowProcess = (transport: IWorkerTransport): Promise<{ code: number; signal: string; }> => {
  return new Promise((resolve, reject) => {

    const runnerPath = path.join(__dirname, './runner.ts');
    const forked = fork(runnerPath);

    forked.on('close', (code) => code === 0 ? resolve() : reject());

    forked.send(transport);
  });
};

(async () => {

  const transport1: IWorkerTransport = {
    context: await new AuthConfig({
      authOptions: {
        siteUrl: 'https://spnode.sharepoint.com/sites/ci',
        username: 'john.doe@spnode.onmicrosoft.com',
        password: 'ea0ac4a1f30b61fe6a09d694bc6f2cbcc86a54b39fe7596905caeb09e8529a3deb594dc8a0b8c2662ab4673d19f058c2tXxYctqr3HCzIrXD6usaaQ=='
      } as any
      // configPath: './config/multiproc/private.1.json'
    }).getContext()
  };
  const transport2: IWorkerTransport = {
    context: await new AuthConfig({
      authOptions: {
        siteUrl: 'https://spnode.sharepoint.com/sites/ci',
        username: 'andrew.koltyakov@spnode.onmicrosoft.com',
        password: '0a20fcba40e028455c4e8bc5dad483fd2e5382db964698693ede9be88c94f981173ec447663b5a57128dafade7ef2e46tbrV2KfA9qpBgcwK1PO38g=='
      } as any
      // configPath: './config/multiproc/private.2.json'
    }).getContext()
  };

  await Promise.all([
    startWorkflowProcess(transport1),
    startWorkflowProcess(transport2)
  ])
    .catch(console.warn);

  console.log('Done');

})()
  .catch((error) => {
    console.warn(error);
    // process.exit(1);
  });
