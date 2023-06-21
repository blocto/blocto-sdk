import { EIP1193Provider } from 'eip1193-provider';

export interface ProviderSession {
  connected?: boolean;
  code?: string | null;
  accounts: Record<string, string[] | undefined>;
}

declare interface BloctoProviderInterface extends EIP1193Provider {
  isBlocto: boolean;
  isConnecting: boolean;
  appId: string;
  eventListeners: {
    [key: string]: Array<(arg?: any) => void>;
  };
  sessionKey: string;
  session: ProviderSession;
}

export default BloctoProviderInterface;
