# System Purpose

The client is the user-facing React SPA for Denamu. It consumes the server API and renders RSS-aggregated blog content with features including trending feeds, search, developer chat, and user authentication.

# Stack

[Core]

- React 18
- Vite(SWC)
- Zustand v5 (global UI state)
- TanStack React Query v5 (server state + caching)
- Axios with credentials
- Socket.io-client (chat, trending)
- Tailwind CSS
- shadcn/ui (Radix UI)
- Framer Motion

[Test]

- Vitest

# Directory Structure

| Directory          | Role                                                       |
| ------------------ | ---------------------------------------------------------- |
| src/pages/         | Page-level components, one per route                       |
| src/routes/        | React Router route definitions                             |
| src/components/    | Feature components (auth, admin, chat, common, ui)         |
| src/store/         | Zustand stores (auth, search, sidebar, chat, filter, etc.) |
| src/hooks/         | Custom hooks: auth/, queries/, common/                     |
| src/api/services/  | Axios service layer per domain                             |
| src/api/mocks/     | MSW handlers for development                               |
| src/constants/     | API endpoint constants                                     |
| src/types/         | TypeScript type definitions                                |
| src/providers/     | React context providers (TanStack Query)                   |
| src/components/ui/ | shadcn/ui base components                                  |

# Routing

Background Location pattern is used: PostDetailPage renders as a modal overlay on the feed list, or as a full page on direct navigation.

Pages are lazy-loaded via React.lazy() for code splitting.

# State Management

| Store                 | Purpose                                       |
| --------------------- | --------------------------------------------- |
| useAuthStore          | User role (guest / user / admin), token state |
| useSearchStore        | Search params, filter type, pagination        |
| useSidebarStore       | Sidebar visibility                            |
| useChatStore          | WebSocket chat state                          |
| useRegisterModalStore | RSS registration modal                        |
| React Query           | Server data fetching, caching, refetch        |

# Build Configuration

Vite manual chunks split vendor libraries to optimize bundle size: radix-ui, charts (recharts), vendor (react core), animation (framer-motion), query, socket, utils.

Dev server uses `usePolling: true` for file system compatibility in Docker/WSL.

# Commands

npm run dev - Development server (port 5173)
npm run build - Production build (tsc + vite build)
npm run lint - ESLint
npm run test - Vitest
npm run test:coverage - Vitest with coverage report
