# System Purpose

User-facing React SPA for Denamu. Consumes the server API to render RSS-aggregated blog content with trending feeds, search, developer chat, and OAuth authentication.

# Stack

[Core] React 18, TypeScript 5.6 (strict), Vite 5 + SWC, React Router v6
[State] Zustand v5 (client UI), TanStack React Query v5 (server state + caching)
[API] Axios (withCredentials, interceptor token management), Socket.io-client (chat, trending)
[UI] Tailwind CSS 3 (class dark mode), shadcn/ui (Radix UI), Framer Motion, Recharts, Lucide React
[Test] Vitest + jsdom, Testing Library, Playwright (E2E), MSW (API mocking)

# Directory Structure

```
src/
├── api/
│   ├── instance.ts          # Axios instance (interceptors, token refresh)
│   ├── services/             # Domain API modules (admin/, chart/, posts, rss, search, user, view)
│   └── mocks/                # MSW handlers (development)
├── components/
│   ├── about/                # Landing page sections
│   ├── admin/                # Admin dashboard (RSS management)
│   ├── auth/                 # Login/signup forms, OAuth
│   ├── chart/                # Recharts components
│   ├── chat/                 # WebSocket chat UI
│   ├── common/Card/          # PostCard, PostDetail, PostCardGrid
│   ├── filter/               # Tag filter UI
│   ├── layout/               # Layout, Header, Sidebar, Navigation
│   ├── profile/              # User profile, activity graph
│   ├── RssRegistration/      # RSS registration modal/form
│   ├── search/               # Search modal + filters
│   ├── sections/             # MainContent, Trending, Latest, AnimatedPostGrid
│   └── ui/                   # shadcn/ui base components
├── constants/                # API endpoints, messages, dummy data
├── hooks/
│   ├── auth/                 # useSignIn, useSignUp
│   ├── queries/              # React Query wrappers (infinite scroll, search, trending)
│   └── common/               # useMediaQuery, useKeyboardShortcut, useInView, etc.
├── lib/                      # cn() utility (clsx + tailwind-merge)
├── pages/                    # Page components (1:1 route mapping)
├── providers/                # QueryProvider (TanStack Query)
├── routes/                   # React Router definitions
├── store/                    # Zustand stores
├── types/                    # TypeScript type definitions
└── utils/                    # jwt, date, debounce, pagination, etc.
```

# Routing

React Router v6 with **Background Location pattern**. All pages code-split via `React.lazy()`.

| Path                | Page             | Notes                                    |
| ------------------- | ---------------- | ---------------------------------------- |
| `/`                 | Home             | Feed list + trending                     |
| `/:id`             | PostDetailPage   | Modal (backgroundLocation) or full page  |
| `/admin`            | Admin            | RSS management dashboard                 |
| `/about`            | AboutService     | Landing page (first-visit redirect)      |
| `/signin`           | SignIn           | Login                                    |
| `/signup`           | SignUp           | Registration                             |
| `/oauth-success`    | OAuthSuccessPage | OAuth callback handler                   |
| `/user/certificate` | UserCertificate  | Email verification                       |
| `/profile`          | Profile          | User profile                             |

`/:id` with `state.backgroundLocation` → modal overlay; direct URL → full page render.

# State Management

| Zustand Store         | Purpose                                     |
| --------------------- | ------------------------------------------- |
| useAuthStore          | JWT token, user role (guest/user/admin)     |
| useSearchStore        | Search query, filter type, pagination       |
| useAdminSearchStore   | Admin panel search state                    |
| useChatStore          | WebSocket connection, message history       |
| useChatValueStore     | Chat input value                            |
| useRegisterModalStore | RSS registration form state + validation    |
| useSidebarStore       | Mobile sidebar toggle                       |
| useFilterStore        | Tag filters (max 5)                         |
| useMediaStore         | Responsive state (mobile/desktop)           |
| useTapStore           | Home tab selection (main/chart)             |
| usePostTypeStore      | Feed sorting (latest/recommend)             |
| useVisitStore         | First-visit flag (localStorage persistence) |

React Query handles all server data fetching, caching, and automatic refetching.

# API Layer

Axios instance in `src/api/instance.ts`: `baseURL: "/api"`, `timeout: 10s`, `withCredentials: true`.

- **Request Interceptor:** Auto-injects `Authorization: Bearer` header
- **Response Interceptor:** On 401 → single retry via `refreshAccessToken()`. `refreshPromise` deduplicates concurrent refreshes. `_skipRefresh` flag prevents infinite loops. On failure → clears token + rejects.

# Key Patterns

**Background Location Modal:** PostCard click passes `{ backgroundLocation: location }` state. Router renders modal overlay when present, full page otherwise.

**Infinite Scroll:** `useInfiniteQuery` with cursor-based pagination (postId, limit: 12). Triggered by `useInView` (IntersectionObserver).

**Token Management:** Access token in Zustand memory (non-persistent). Refresh token in HttpOnly cookie (server-managed). Client-side JWT decode for role parsing.

**Search:** 300ms debounce, enabled when input > 0, staleTime 5min.

**Responsive:** Mobile breakpoint 768px via `useMediaQuery`. Component branching: DesktopCard / MobileCard.

# Data Flow

```
Server API ←(HTTP/WS/SSE)→ Axios instance / Socket.io
    ↓
React Query (server state cache) ←→ Zustand (UI state)
    ↓
Components (pages → sections → cards)
```

- HTTP: REST API (`/api/*`) — feeds, search, auth, admin
- WebSocket: Socket.io — real-time chat
- SSE: Trending feed real-time updates

# Build Configuration

Vite manual chunks: vendor (react core), radix-ui (14 packages), query, charts (recharts), animation (framer-motion), socket, utils (cva/clsx/tw-merge/zustand), ui-utils (lucide/avvvatars/cmdk).

Dev server: `usePolling: true` (Docker/WSL compatibility). Path alias: `@` → `./src/`.

# Commands

```
npm run dev                   # Dev server (port 5173)
npm run build                 # Production build (tsc + vite build --mode prod)
npm run build:local           # Local build (tsc + vite build)
npm run lint                  # ESLint
npm run test                  # Vitest (watch mode)
npm run test:coverage         # Vitest + coverage report
npm run test:e2e              # Playwright (excludes @oauth-real)
npm run test:e2e:oauth-smoke  # OAuth smoke tests only
```

# Test Structure

**Unit** (`src/__tests__/`): jsdom, v8 coverage, scope `components/**` + `hooks/**`. Mocks: IntersectionObserver, lucide-react, shadcn/ui.

**E2E** (`src/__tests__/e2e/`): Playwright (chromium/firefox/webkit). `auth-jwt.spec.ts` (JWT, refresh cookie, OAuth callback), `oauth-real.smoke.spec.ts` (`@oauth-real` tag).

# API Endpoints

```
ADMIN:  /api/admin/login, /api/admin/rss, /api/admin/register
BLOG:   /api/feed, /api/rss
CHART:  /api/statistic/today, /api/statistic/all, /api/statistic/platform
SEARCH: /api/feed/search
USER:   /api/user/register, /api/user/login, /api/user/refresh, /api/user/logout
OAUTH:  /api/oauth
```
