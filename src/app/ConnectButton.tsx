'use client'

import { useEffect, useState } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'

export function ConnectButton() {
  const [mounted, setMounted] = useState(false)
  const { address, isConnected } = useAccount()
  const { connectors, connect } = useConnect()
  const { disconnect } = useDisconnect()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <div className="h-10" />

  if (isConnected) {
    return (
      <button 
        onClick={() => disconnect()}
        className="px-4 py-2 bg-pink-100 text-pink-600 rounded-xl font-semibold hover:bg-pink-200 transition-colors"
      >
        Disconnect {address?.slice(0, 6)}...{address?.slice(-4)}
      </button>
    )
  }

  return (
    <div className="flex gap-2">
      {connectors
        .filter((connector) => !connector.name.toLowerCase().includes('okx'))
        .map((connector) => (
        <button
          key={connector.uid}
          onClick={() => connect({ connector })}
          className="px-4 py-2 bg-pink-500 text-white rounded-xl font-semibold hover:bg-pink-600 transition-colors shadow-md"
        >
          Connect {connector.name}
        </button>
      ))}
    </div>
  )
}
