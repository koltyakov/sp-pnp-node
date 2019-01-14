import { IAuthOptions } from 'node-sp-auth';
import { IAuthConfigSettings } from 'node-sp-auth-config';
import { AgentOptions } from 'https';

export interface IPnpNodeSettings {
  siteUrl?: string;
  authOptions?: IAuthOptions;
  config?: IAuthConfigSettings;
  envCode?: 'spo' | '15' | '16';
  httpsAgentOptions?: AgentOptions;
}
