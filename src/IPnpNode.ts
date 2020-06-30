import { IAuthOptions } from 'node-sp-auth';
import { IAuthConfigSettings } from 'node-sp-auth-config';
import { AgentOptions } from 'https';
import { IFetchOptions } from '@pnp/common-commonjs';

export type FetchSpy = (url: string, options: IFetchOptions, authClientId: string, authCredsHash: string) => void;

export interface IPnpNodeSettings {
  siteUrl?: string;
  authOptions?: IAuthOptions;
  config?: IAuthConfigSettings;
  envCode?: 'spo' | '15' | '16';
  httpsAgentOptions?: AgentOptions;
  fetchSpy?: {
    beforeRequest?: FetchSpy;
  };
  clientInstance?: string;
}
