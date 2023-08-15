import { configureChains } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { polygon, optimism, arbitrum, bsc, polygonMumbai } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [polygonMumbai, bsc, polygon, optimism, arbitrum],
  [alchemyProvider({ apiKey: process.env.ALCHEMY_ID || '' }), publicProvider()]
);

export { chains, publicClient, webSocketPublicClient };
