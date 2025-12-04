import { http, createConfig } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { injected, metaMask } from 'wagmi/connectors';

export const wagmiConfig = createConfig({
  chains: [baseSepolia],
  connectors: [
    injected({ 
      target: 'metaMask',
    }),
    metaMask(),
  ],
  transports: {
    [baseSepolia.id]: http(),
  },
});
