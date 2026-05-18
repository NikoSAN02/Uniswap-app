'use client'

import { lightTheme } from '@uniswap/widgets'
import dynamic from 'next/dynamic'

const SwapWidget = dynamic(
  () => import('@uniswap/widgets').then((mod) => mod.SwapWidget),
  { ssr: false }
)

import { useMemo, useEffect, useState } from 'react'
import { useConnectorClient } from 'wagmi'
import { providers } from 'ethers'
import { ConnectButton } from './ConnectButton'

// Suppress known harmless third-party React warnings from popping up
if (typeof window !== 'undefined') {
  // Polyfill for brotli/emscripten "Browser is not defined" error
  ;(window as any).Browser = {
    T: () => {}
  }

  const originalError = console.error
  const originalWarn = console.warn
  
  const suppressPatterns = [
    /React does not recognize the `[^`]+` prop on a DOM element/,
    /Received `[^`]+` for a non-boolean attribute/,
    /styled-components: it looks like an unknown prop "[^"]+" is being sent through to the DOM/,
    /Lit is in dev mode/
  ]
  
  console.error = (...args) => {
    if (typeof args[0] === 'string' && suppressPatterns.some(pattern => pattern.test(args[0]))) return
    originalError.call(console, ...args)
  }
  
  console.warn = (...args) => {
    if (typeof args[0] === 'string' && suppressPatterns.some(pattern => pattern.test(args[0]))) return
    originalWarn.call(console, ...args)
  }
}

const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
const jsonRpcUrlMap = alchemyApiKey ? {
  1: [`https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`],
  137: [`https://polygon-mainnet.g.alchemy.com/v2/${alchemyApiKey}`],
} : {
  1: ['https://eth.llamarpc.com'],
  137: ['https://polygon.llamarpc.com'],
}

export default function Home() {
  const { data: client } = useConnectorClient()
  const [uniswapTokenList, setUniswapTokenList] = useState<any>(null)
  const [listError, setListError] = useState(false)

  useEffect(() => {
    // Fetch the official Uniswap token list manually
    fetch('https://tokens.uniswap.org')
      .then(res => res.json())
      .then(data => {
        // Filter out any tokens with malformed addresses that break the Widget's strict regex validation
        const cleanTokens = data.tokens.filter((t: any) => /^0x[a-fA-F0-9]{40}$/i.test(t.address))
        setUniswapTokenList({ ...data, tokens: cleanTokens })
      })
      .catch(err => {
        console.error("Failed to fetch official uniswap list:", err)
        setListError(true)
      })
  }, [])

  const provider = useMemo(() => {
    if (client?.transport) {
      const network = {
        chainId: client.chain.id,
        name: client.chain.name,
      }
      return new providers.Web3Provider(client.transport as any, network)
    }
    return undefined
  }, [client])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#F9FAFB] p-4 relative">
      <div className="absolute top-6 right-6 z-50">
        <ConnectButton />
      </div>

      <div className="z-10 w-full max-w-md flex flex-col items-center justify-center gap-6">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500 tracking-tight">
          Swap Tokens
        </h1>
        
        <div className="w-full shadow-2xl rounded-[32px] overflow-hidden border border-gray-100 bg-white min-h-[300px] flex items-center justify-center">
          {!uniswapTokenList && !listError ? (
            <div className="text-gray-500 font-medium">Loading official Uniswap tokens...</div>
          ) : listError ? (
            <div className="text-red-500 font-medium">Failed to load official Uniswap tokens</div>
          ) : (
            <SwapWidget 
              provider={provider}
              jsonRpcUrlMap={jsonRpcUrlMap}
              theme={lightTheme}
              defaultInputTokenAddress="NATIVE"
              hideConnectionUI={true}
              tokenList={uniswapTokenList.tokens}
            />
          )}
        </div>
      </div>
    </main>
  )
}
