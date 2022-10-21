
interface Session {
  code?: string;
  address?: {
    [key: string]: string
  };
  chainId?: number;
  appId?: string;
}

export default Session;

