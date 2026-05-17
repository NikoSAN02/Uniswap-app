import { http, createConfig, fallback } from 'wagmi'
import { mainnet, polygon } from 'wagmi/chains'

const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY

export const config = createConfig({
  chains: [mainnet, polygon],
  ssr: true,
  transports: {
    [mainnet.id]: alchemyApiKey ? fallback([http(`https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`), http('https://eth.llamarpc.com')]) : http('https://eth.llamarpc.com'),
    [polygon.id]: alchemyApiKey ? fallback([http(`https://polygon-mainnet.g.alchemy.com/v2/${alchemyApiKey}`), http('https://polygon.llamarpc.com')]) : http('https://polygon.llamarpc.com'),
  },
})
