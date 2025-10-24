# PayNeu UI

A modern, user-facing interface for blockchain-based payment processing, invoice management, and merchant operations. This application enables merchants to create invoices and accept cryptocurrency payments seamlessly while providing customers with a simple payment experience.

## Overview

PayNeu is a secure blockchain payment solution built on Base Sepolia testnet. The platform allows businesses to:
- Create and manage payment invoices
- Accept cryptocurrency payments from customers
- Automatically convert various crypto assets to stablecoins
- Manage supported payment tokens
- Access test tokens via an integrated faucet

## Tech Stack

### Frontend Framework
- **React 18** - Modern UI library for building interactive user interfaces
- **TypeScript** - Type-safe JavaScript for better developer experience
- **Vite** - Fast build tool and development server

### Routing & State Management
- **React Router DOM v6** - Client-side routing and navigation
- **SWR** - Data fetching and caching library
- **TanStack Query (React Query)** - Server state management

### Blockchain Integration
- **Wagmi v2** - React hooks for Ethereum development
- **Viem v2** - TypeScript interface for Ethereum
- **Reown AppKit** - Web3 wallet connection interface (formerly WalletConnect)
- **Base Sepolia** - Layer 2 blockchain testnet

### Styling
- **Tailwind CSS** - Utility-first CSS framework
- **PostCSS** - CSS processing tool
- **Autoprefixer** - Automatic vendor prefixing

### Development Tools
- **ESLint** - Code linting and quality enforcement
- **TypeScript ESLint** - TypeScript-specific linting rules
- **pnpm** - Fast, disk-efficient package manager

### API Integration
- **Orval** - OpenAPI client generator (generates type-safe API hooks from OpenAPI spec)
- **PayNeu API** - Backend REST API hosted on Railway

## Application Structure

### Pages

#### Public Pages
- **Homepage** (`/`) - Landing page with platform overview and feature highlights
- **Invoice Page** (`/invoice/:id`) - Customer-facing invoice payment interface

#### Admin Dashboard (`/admin`)
- **Invoice Management** - Create and manage payment invoices
- **Token Management** - Add and configure supported payment tokens
- **Faucet** - Mint test tokens for development and testing

### Key Features

1. **Invoice Creation & Management**
   - Create invoices with merchant details, token selection, and amount
   - View all invoices with real-time status updates
   - Track payment status for each invoice

2. **Crypto Payment Processing**
   - Accept payments in various supported tokens
   - Automatic token conversion to stablecoins via integrated DEX
   - Wallet connectivity via Reown AppKit (supports multiple wallets)

3. **Token Management**
   - Register new ERC-20 tokens for payment acceptance
   - Configure token addresses and metadata
   - View supported payment methods

4. **Test Token Faucet**
   - Mint test tokens for development purposes
   - Support for multiple token contracts
   - Easy wallet-based distribution

### Architecture

```
src/
├── api/              # Auto-generated API client from OpenAPI spec
├── components/       # Reusable UI components (WalletButton, etc.)
├── config/          # Configuration files (wallet setup, etc.)
├── layouts/         # Page layouts (AdminLayout)
├── pages/           # Route components
│   ├── admin/      # Admin dashboard pages
│   └── public/     # Public-facing pages
└── providers/       # React context providers (WalletProvider)
```

## Setup & Installation

### Prerequisites
- Node.js (v18 or higher)
- pnpm package manager
- Reown (WalletConnect) Project ID

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_REOWN_PROJECT_ID=your-project-id-here
```

Get your Reown Project ID from: https://cloud.reown.com

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Run linter
pnpm lint
```

## Development

The application runs on Vite's development server with hot module replacement (HMR) for a smooth development experience. All API calls are made to the PayNeu API backend hosted on Railway.

### API Integration

The `src/api/payneu-api.ts` file is auto-generated from the OpenAPI specification using Orval. This provides type-safe API hooks and functions for all backend endpoints:

- Merchant management
- Invoice creation and retrieval
- Payment processing
- Token management
- Faucet operations

## Deployment

Built for deployment on modern hosting platforms with support for Single Page Application (SPA) routing. The production build outputs to the `dist/` directory.

## Contributing

Built by [@sleepbuildrun](https://x.com/sleepbuildrun)

## License

Copyright 2025 PayNeu. All rights reserved.
