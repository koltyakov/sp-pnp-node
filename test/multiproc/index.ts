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
      configPath: './config/multiproc/private.1.json'
    }).getContext()
  };
  const transport2: IWorkerTransport = {
    context: await new AuthConfig({
      configPath: './config/multiproc/private.2.json'
    }).getContext()
  };

  await Promise.all([
    startWorkflowProcess(transport1),
    startWorkflowProcess(transport2)
  ])
    .catch(console.warn);

  console.log('Done');

})()
  .catch(console.warn);
