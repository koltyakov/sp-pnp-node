import { IAuthOptions } from 'node-sp-auth';
import { IAuthConfigSettings } from 'node-sp-auth-config';

export interface IPnpNodeSettings {
    siteUrl?: string;
    authOptions?: IAuthOptions;
    config?: IAuthConfigSettings;
}
