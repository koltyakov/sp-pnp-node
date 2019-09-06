import { IAuthOptions } from 'node-sp-auth';
import { IAuthConfigSettings } from 'node-sp-auth-config';
import { AgentOptions } from 'https';
import { FetchOptions } from '@pnp/common';

export type FetchSpy = (url: string, options: FetchOptions, authClientId: string, authCredsHash: string) => void;

export interface IPnpNodeSettings {
  siteUrl?: string;
  authOptions?: IAuthOptions;
  config?: IAuthConfigSettings;
  envCode?: 'spo' | '15' | '16';
  httpsAgentOptions?: AgentOptions;
  fetchSpy?: {
    beforeRequest?: FetchSpy;
  };
}
