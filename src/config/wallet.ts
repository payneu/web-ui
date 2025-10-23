import { createAppKit } from '@reown/appkit/react'
import { baseSepolia } from '@reown/appkit/networks'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

// 1. Get projectId from https://cloud.reown.com
export const projectId = (import.meta as any).env?.VITE_REOWN_PROJECT_ID || 'your-project-id-here'

// 2. Create a metadata object - optional
const metadata = {
  name: 'PayNeu',
  description: 'PayNeu - Secure blockchain payments',
  url: 'https://payneu.com', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

// 3. Set the networks
const networks = [baseSepolia]

// 4. Create Wagmi Adapter
export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: false
})

// 5. Create AppKit
export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks: networks as any,
  metadata,
  projectId,
  features: {
    analytics: true
  }
})