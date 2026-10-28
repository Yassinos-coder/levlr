# Levlr Terminal — Product & Technical Spec

> Name: **Levlr Terminal**.
> Version 0.1 · 28 Oct 2026 · Author: Yassine

---

## 1. Vision

A web-based multi-asset trading terminal (Forex, CFDs, crypto, stocks) that connects to the user's **own broker accounts via API**. It has a professional docked layout, built-in risk control, and an **optional, read-only AI copilot** that understands the user's chart, including their drawings and indicators, without manual screenshots.

**Platforms:** Web (v1), then Desktop (Tauri), then Mobile (Expo).
**Primary broker for v1:** IC Markets via **cTrader Open API**.

### Core principles

1. **Risk first.** Position size is calculated from SL distance and risk %. Hard limits are enforced in code.
2. **The AI is optional and read-only.** It reads charts, drawings, indicators and positions. It **never** places, modifies or closes orders.
3. **Bring your own accounts and keys.** Users connect their own broker (OAuth) and their own Claude API key.
4. **One terminal, many brokers.** A broker adapter layer hides each broker's differences.
5. **Your layout, your way.** Docked panels with tabs, a default tab per panel, and saved workspaces.

---

## 2. Feature Set

### MVP (v1, web)
- Account system (sign up, log in, settings)
- Connect a **cTrader** account (IC Markets) via OAuth, demo first, then live
- Docked layout: Chart, Watchlist, Order Book / Contract specs, Order Ticket, Positions/Orders/History
- **TradingView Advanced Charts** with drawings and built-in indicators
- **Levlr indicator** ported to the chart (ATR projection levels, structure, MTF MA trend)
- Live prices and candles from the broker
- Order ticket: market, limit and stop orders, **risk-based sizing**, SL/TP
- Position management: **Close, Partial close, Move SL to BE, Modify SL/TP, Cancel pending**
- Risk engine: max risk per trade, max total open risk, daily loss lock
- Saved layouts and workspaces (synced via Supabase)

### v1.1
- **AI Copilot panel** (Claude, user's own key) with an "Analyze my chart" button
- Right-click a drawing → "Ask AI about this zone"
- Pre-trade checklist (rules check before sending an order)
- Trade journal with an auto-snapshot of the chart and analysis at entry

### v2+
- Crypto exchange adapter (Bybit or Binance)
- OANDA, then Alpaca / IBKR (stocks)
- Alerts (price, zone entry, structure break) with optional AI comment
- Stats dashboard (session, weekday, hour and symbol breakdowns, like the IC Markets report)
- Desktop app (Tauri) with pop-out windows
- Mobile app (Expo)

---

## 3. UI Layout

```
┌─[Order Book]─[Watchlist]─[Contract]─┬──────────── CHART ────────────┬─[Ticket]─[AI]─[News]─┐
│  default: Watchlist                  │  TradingView Advanced Charts  │  default: Ticket       │
│                                      │  drawings · indicators ·      │                        │
│                                      │  Levlr levels                 │                        │
├─[Positions]─[Orders]─[History]─[Journal]─[Stats]──────────────────────────────────────────────┤
│  default: Positions   →  per row: [Close] [Partial] [BE] [Modify SL/TP] [Cancel]               │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
```

- **Every panel is a tab group.** Any widget can go in any panel.
- **Default tab per panel:** right-click a tab and choose "Set as default".
- **Drag and drop** tabs between panels and split panels. Pop-outs come with the desktop version.
- **Symbol linking (colour groups):** panels linked to the chart follow its symbol.
- **Workspaces:** presets such as "Scalping", "Swing" and "Analysis", saved per user in Supabase.

Layout is stored as JSON (Dockview `toJSON()` / `fromJSON()`):

```json
{
  "workspace": "Swing",
  "panels": [
    { "id": "left",   "tabs": ["watchlist", "orderBook", "contract"], "defaultTab": "watchlist", "link": "blue" },
    { "id": "center", "tabs": ["chart"], "link": "blue" },
    { "id": "right",  "tabs": ["ticket", "ai", "news"], "defaultTab": "ticket", "link": "blue" },
    { "id": "bottom", "tabs": ["positions", "orders", "history", "journal", "stats"], "defaultTab": "positions" }
  ]
}
```

---

## 4. Architecture

```
               ┌──────────────────────────────────────────────┐
  Browser ───► │  Web App (React + Vite)                      │
               │  Dockview · TradingView Advanced Charts      │
               │  Zustand · TanStack Query · Web Workers      │
               └───────────────┬──────────────────────────────┘
                     REST       │      WebSocket (prices, positions, events)
               ┌───────────────▼──────────────────────────────┐
               │  NestJS Backend                               │
               │  ├─ API Gateway (REST + WS gateway)           │
               │  ├─ Broker Adapters  (cTrader, Bybit, …)      │
               │  ├─ Market Data Service (spots, candles)      │
               │  ├─ Order & Position Engine                   │
               │  ├─ Risk Engine                               │
               │  ├─ AI Service (Anthropic SDK, tool use)      │
               │  └─ Journal & Analytics                       │
               │  Redis: pub/sub (price fan-out), cache        │
               │  BullMQ: jobs (journal sync, stats, alerts)   │
               └───────┬───────────────────────┬──────────────┘
                       │                       │
              ┌────────▼────────┐     ┌────────▼─────────────────┐
              │  Supabase       │     │  Broker APIs              │
              │  Postgres · Auth│     │  cTrader Open API (IC)    │
              │  Storage · Vault│     │  Bybit / OANDA / Alpaca…  │
              │  RLS            │     └───────────────────────────┘
              └─────────────────┘
```

**Important:** broker connections are **long-lived** (TCP/WebSocket with heartbeats). They must run on **always-on servers** (Railway, Fly.io, a VPS), **not** serverless functions.

---

## 5. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Monorepo | **Turborepo + pnpm**, TypeScript everywhere | Shared packages reused by desktop and mobile |
| Web app | **React + Vite** (SPA) | A terminal is an app; no SEO needed |
| Marketing site | Next.js (separate app) | Landing page, docs, pricing |
| UI | **Tailwind CSS + shadcn/ui** | Dark-first terminal theme |
| Docking / tabs | **Dockview** | Tab groups, default tab, drag and drop, JSON layouts |
| Charts | **TradingView Advanced Charts** | See section 6 |
| State | **Zustand** (real-time) + **TanStack Query** (server cache) | |
| Heavy calculations | **Web Workers** | Indicators and risk maths off the main thread |
| Backend | **NestJS** | Modular services, WS gateway |
| Real-time | **Socket.IO / ws** + **Redis pub/sub** | Price fan-out |
| Jobs | **BullMQ** (Redis) | Journal sync, stats, alerts |
| Database | **Supabase (Postgres)** | Users, layouts, drawings, journal, settings |
| Auth | **Supabase Auth** | Email, Google; NestJS verifies the Supabase JWT |
| File storage | **Supabase Storage** | Chart snapshots for the journal |
| Secrets | **Supabase Vault** or app-level envelope encryption with a KMS | Broker tokens and Claude keys |
| ORM | **Drizzle** (or Prisma) | Typed queries from NestJS |
| AI | **Anthropic SDK** (Claude, tool use, vision) | User brings their own key |
| Hosting | **Railway** (backend, Redis), Vercel or Cloudflare Pages (web) | Backend always on |
| Monitoring | **Sentry** + OpenTelemetry | Order and feed failures must be visible |
| Desktop (later) | **Tauri** | Wraps the web app; native pop-outs |
| Mobile (later) | **Expo** (React Native) | Shared packages; chart in a WebView |

### What Supabase does and does not handle

| ✅ Supabase | ❌ Not Supabase |
|---|---|
| Users and auth | Live tick streaming (use the NestJS WS gateway with Redis) |
| Layouts, workspaces, watchlists | Long-lived broker connections (use NestJS workers) |
| Drawings and chart state (save/load adapter) | High-frequency order execution logic |
| Journal, trades, stats | |
| Encrypted secrets (Vault) | |
| Notifications such as alerts (Supabase Realtime is fine here) | |

---

## 6. Charting — TradingView

**Decision: use TradingView.** It's the industry standard, has the best drawing tools, and traders already know it.

| Library | Drawings | Indicators | Trading UI | Cost / licence |
|---|---|---|---|---|
| Lightweight Charts | ❌ | ❌ | ❌ | Free, open source |
| **Advanced Charts** ✅ v1 | ✅ 70+ tools | ✅ 100+ built-in | ❌ (we build our own panels) | **Free with approval** |
| Trading Platform (later?) | ✅ | ✅ | ✅ Order ticket, account manager, Broker API | Paid, by agreement |

### How we use Advanced Charts

- **Data:** we implement TradingView's **Datafeed API** (JS API). Candles and real-time bars come from our backend, which gets them from the broker.
- **Drawings to AI:** read drawings from the chart API, e.g. `widget.activeChart().getAllShapes()`, then `getShapeById(id).getPoints()` and `getProperties()`. The AI gets exact prices and times.
- **Saving drawings and layouts:** implement the **save_load_adapter** so chart layouts and drawings are stored in Supabase per user.
- **Screenshots:** the library can capture the chart, so no manual screenshots.
- **Levlr indicator:** **Pine Script does not run in the library.** It must be **ported to JavaScript** as a **custom indicator** (`custom_indicators_getter`). Put the maths in a shared package (`packages/indicators`) so the AI service and alerts can use the same calculations on the backend.

### Licensing notes and risks

- Advanced Charts requires an **application and approval** by TradingView, usually for a public web product run by a company or individual project. **Apply early.**
- TradingView attribution and branding rules apply. Read the licence terms.
- Access is through a private GitHub repo after approval.
- **Fallback if not approved or delayed:** **KLineCharts** (open source, built-in overlays/drawings). Keep chart code behind a `ChartAdapter` interface so the library can be swapped.

---

## 7. Broker Integration

### 7.1 IC Markets via cTrader Open API (v1)

- IC Markets offers **cTrader** accounts. The **cTrader Open API** (by Spotware) is official and free.
- **MT5 has no official public API.** Paid third-party bridges like MetaApi exist; not for v1.
- **Action:** open a **cTrader demo account** at IC Markets, then register the app with Spotware.

**Flow**
1. Register the application at Spotware's Open API portal to get a client ID and secret.
2. User clicks "Connect IC Markets", goes through the cTrader **OAuth2** login, and we receive an access token and refresh token.
3. The backend opens a connection (Protobuf over TCP, or JSON over WebSocket) to the **demo** or **live** endpoint.
4. Authenticate the application (`ProtoOAApplicationAuthReq`), then the account (`ProtoOAAccountAuthReq`).
5. Subscribe to spot prices (`ProtoOASubscribeSpotsReq`) and fetch candles (`ProtoOAGetTrendbarsReq`).
6. Orders: `ProtoOANewOrderReq`; partial or full close: `ProtoOAClosePositionReq` (volume = partial amount); SL/TP: `ProtoOAAmendPositionSLTPReq`.
7. Sync state on connect and after any reconnect: `ProtoOAReconcileReq`. Listen to `ProtoOAExecutionEvent`.
8. Send heartbeats to keep the connection alive. Respect rate limits.

> ⚠️ Volume and price units in cTrader are scaled integers (e.g. volume in hundredths of a unit). Always convert via symbol specs. **Check the latest Spotware docs before implementing.**

The same adapter works for **all cTrader brokers** (FP Markets, Pepperstone, etc.).

### 7.2 Broker adapter interface

```ts
// packages/broker-core/src/BrokerAdapter.ts
export interface BrokerAdapter {
  id: 'ctrader' | 'bybit' | 'oanda' | 'alpaca' | 'ibkr';

  connect(credentials: BrokerCredentials): Promise<void>;
  disconnect(): Promise<void>;
  reconcile(): Promise<AccountSnapshot>;          // positions + orders + balance

  // Market data
  getSymbols(): Promise<SymbolSpec[]>;            // digits, lot size, contract size, min/step volume
  getCandles(req: CandleRequest): Promise<Candle[]>;
  subscribeQuotes(symbols: string[], cb: (q: Quote) => void): Unsubscribe;
  getOrderBook?(symbol: string): Promise<OrderBook>; // when supported

  // Account
  getAccount(): Promise<AccountInfo>;             // balance, equity, margin, currency

  // Trading
  placeOrder(req: OrderRequest): Promise<OrderResult>;
  modifyOrder(id: string, changes: OrderChanges): Promise<void>;
  cancelOrder(id: string): Promise<void>;
  closePosition(id: string, volume?: number): Promise<void>; // volume → partial close
  modifyPosition(id: string, sl?: number, tp?: number): Promise<void>;

  onExecution(cb: (e: ExecutionEvent) => void): Unsubscribe;
}
```

### 7.3 Broker roadmap

1. **IC Markets (cTrader)** — v1
2. Bybit or Binance (crypto)
3. OANDA (forex)
4. Alpaca / IBKR (stocks)

---

## 8. Risk Engine

Enforced **in code, before** any order reaches the broker.

| Rule | Default (user-configurable) |
|---|---|
| Lot size calculated from SL and risk % | Always on. No manual lot entry by default |
| Max risk per trade | 1% (0.25% recommended for prop challenges) |
| Max total open risk | 2–3% (correlated positions counted together) |
| Daily loss lock | e.g. 3%. Ticket disabled until next session |
| Loss-streak cooldown | e.g. after 2 losses → 60 min lock |
| Overtrading guard | e.g. max 5 trades / 30 min |
| Session filter | Warn in user-defined weak hours |
| Prop-firm mode | Daily-loss and trailing drawdown tracker (FTP, FTMO rules) |
| Min lot sanity check | Warn when the broker's minimum lot exceeds the risk % (e.g. oil 0.5 lot) |

---

## 9. AI Copilot (optional, read-only)

### 9.1 How it works
- Off by default. The user adds their **Claude API key** (stored encrypted).
- **"Analyze my chart"** builds a context package automatically: symbol, timeframe, price, **all drawings with exact coordinates**, indicator values (EMAs, MTF trend, ATR levels, swings), recent candles, planned trade, account balance, plus an auto-captured chart image.
- The user's **methodology prompt** (saved in settings) tells Claude how they trade.
- Claude answers with an interpretation, critique and suggestions, using the user's own levels.

### 9.2 Tools exposed to Claude (all read-only)

```ts
get_chart_context()        // symbol, timeframe, visible range, price
get_drawings()             // rectangles, lines, fibs, trendlines with points + labels
get_candles(symbol, tf, n)
get_indicators(symbol, tf) // EMAs, MTF trend, ATR levels, swings (Levlr)
get_positions()            // read only
get_orders()               // read only
get_account()              // balance, equity
calc_position_size(entry, sl, riskPct)
get_calendar(range)        // optional: economic events
propose_annotation(...)    // draws a suggestion on a separate "AI layer" the user can accept or hide
```

**No tool can place, modify or close orders.**

### 9.3 Example context package

```json
{
  "symbol": "NZDUSD", "timeframe": "2H", "price": 0.55919,
  "drawings": [
    { "type": "rectangle", "label": "Supply / LH", "from": 0.5627, "to": 0.5644 },
    { "type": "fib", "levels": { "0.25": 0.56113, "0.5": 0.56367, "-1": 0.54846 } }
  ],
  "indicators": { "mtfTrend": { "1H": "BEARISH", "4H": "BEARISH", "D": "BEARISH", "W": "BEARISH" } },
  "plannedTrade": { "side": "sell", "entry": 0.55919, "sl": 0.5625, "tp": 0.54846, "lots": 0.03 },
  "account": { "balance": 249.92 }
}
```

### 9.4 Cost and efficiency
- Send compact data: a summarised candle window, drawings as JSON, one image.
- About a few thousand tokens per analysis, paid on the user's own key.

---

## 10. Data Model (Supabase / Postgres)

All user tables use **Row Level Security** (`user_id = auth.uid()`).

```sql
-- profiles
profiles (id uuid pk references auth.users, display_name text, timezone text, created_at timestamptz)

-- broker connections (tokens stored encrypted / in Vault)
broker_connections (
  id uuid pk, user_id uuid, broker text,            -- 'ctrader', 'bybit', ...
  environment text,                                 -- 'demo' | 'live'
  external_account_id text, account_label text,
  secret_ref text,                                  -- Vault secret id / encrypted blob ref
  status text, last_sync_at timestamptz, created_at timestamptz
)

-- layouts & workspaces
workspaces (id uuid pk, user_id uuid, name text, layout jsonb, is_default bool, updated_at timestamptz)

-- watchlists
watchlists (id uuid pk, user_id uuid, name text, symbols text[], sort_order int)

-- chart layouts & drawings (TradingView save_load_adapter)
chart_layouts (id uuid pk, user_id uuid, name text, symbol text, resolution text, content jsonb, updated_at timestamptz)
chart_drawings (id uuid pk, user_id uuid, symbol text, shape_type text, points jsonb, properties jsonb, label text, updated_at timestamptz)

-- risk settings
risk_settings (user_id uuid pk, max_risk_pct numeric, max_open_risk_pct numeric,
               daily_loss_pct numeric, cooldown_losses int, cooldown_minutes int,
               max_trades_window int, window_minutes int, weak_hours int[], prop_mode jsonb)

-- journal
trades (
  id uuid pk, user_id uuid, connection_id uuid, broker_position_id text,
  symbol text, side text, volume numeric, entry numeric, exit numeric, sl numeric, tp numeric,
  risk_amount numeric, pnl numeric, r_multiple numeric,
  opened_at timestamptz, closed_at timestamptz, session text,
  snapshot_path text,            -- Supabase Storage (chart image at entry)
  analysis jsonb,                -- context package + AI notes at entry
  notes text, tags text[]
)

-- AI
ai_settings (user_id uuid pk, enabled bool, model text, methodology_prompt text, key_secret_ref text)
ai_conversations (id uuid pk, user_id uuid, symbol text, created_at timestamptz)
ai_messages (id uuid pk, conversation_id uuid, role text, content jsonb, created_at timestamptz)

-- alerts
alerts (id uuid pk, user_id uuid, symbol text, type text, params jsonb, ai_comment bool, active bool)
```

> Tick data is **not** stored in Supabase. Candle caching can be added later (TimescaleDB or a separate store).

---

## 11. Security

- Broker tokens and Claude keys are **encrypted at rest** (Supabase Vault or KMS envelope encryption). They are only decrypted inside the backend, never sent to the browser.
- Request **trading-only** scopes. **Never** handle withdrawal permissions.
- Supabase **RLS** on every user table. NestJS verifies the Supabase JWT on every request and WS connection.
- **Idempotency keys** on order requests to prevent duplicate orders on retry.
- Audit log of every order action (who, what, when, broker response).
- Rate limiting per user. 2FA for live-account actions (later).

---

## 12. Real-time Pipeline

```
cTrader spot event → Adapter (normalize) → Redis pub/sub channel "quotes:IC:NZDUSD"
  → WS Gateway → subscribed browser clients → TradingView datafeed (subscribeBars) + panels
```

- One broker connection per user account. Market data can be shared per symbol where the broker allows.
- On reconnect: **reconcile** positions and orders, then resume streams.
- Back-pressure: throttle UI updates (e.g. 4–10 Hz per symbol) while keeping full precision for orders.

---

## 13. Repository Structure

```
levlr/
├─ apps/
│  ├─ web/               # React + Vite terminal
│  ├─ api/               # NestJS backend (gateway, services, workers)
│  ├─ site/              # Next.js marketing site (later)
│  ├─ desktop/           # Tauri (later)
│  └─ mobile/            # Expo (later)
├─ packages/
│  ├─ broker-core/       # BrokerAdapter interface, shared types
│  ├─ broker-ctrader/    # cTrader Open API adapter
│  ├─ indicators/        # Levlr maths (ATR levels, structure, MTF trend) — shared FE/BE
│  ├─ risk/              # position sizing, risk rules
│  ├─ ai-tools/          # Claude tool schemas + context builder
│  ├─ ui/                # shared React components
│  └─ config/            # eslint, tsconfig, tailwind presets
├─ supabase/
│  └─ migrations/        # SQL schema + RLS policies
└─ turbo.json
```

---

## 14. Milestones

| # | Milestone | Done when |
|---|---|---|
| M0 | **Setup** | Monorepo, Supabase project, auth, NestJS skeleton, CI. TradingView Advanced Charts **application sent**. cTrader demo account opened and app registered |
| M1 | **Layout** | Dockview workspace with tabs, default tabs and saving to Supabase. Placeholder widgets |
| M2 | **Market data** | cTrader demo connected via OAuth. Live quotes and candles in the chart (Datafeed API). Watchlist |
| M3 | **Trading** | Order ticket with risk-based sizing. Positions/Orders panel: Close, Partial, BE, Modify, Cancel. Reconcile on reconnect |
| M4 | **Risk engine** | All rules in section 8 enforced and tested on demo |
| M5 | **Levlr indicator** | Ported to a JS custom indicator. Shared maths package |
| M6 | **AI Copilot** | BYOK, "Analyze my chart", drawings to context, read-only tools |
| M7 | **Journal & stats** | Auto-journal with snapshots, session/day/hour/symbol stats |
| M8 | **Live beta** | Live IC Markets accounts, monitoring, security review |

**Rule:** use it yourself on the IC Markets **demo** and then on the FTP challenge before inviting others.

---

## 15. Risks & Open Questions

| Risk | Mitigation |
|---|---|
| TradingView Advanced Charts not approved or slow | Apply in M0. `ChartAdapter` abstraction. KLineCharts fallback |
| cTrader Open API app approval / limits | Register early. Start with demo. Respect rate limits |
| **Regulation** — AI commentary seen as investment advice | AI is read-only and user-initiated, and analyses the user's own chart. Clear disclaimers. **Get legal advice before a public launch** |
| Security of stored tokens and keys | Vault/KMS, RLS, never expose to the client, audit log |
| Order reliability (disconnects, duplicates) | Idempotency keys, reconcile on reconnect, execution event log, alerts |
| MT5 users can't connect | Later: paid bridge (MetaApi) or only support cTrader/MatchTrader/TradeLocker brokers |
| Market data licensing (stocks) | Use the broker's own feed for the user's own account; review before redistribution |
| Scope creep | Stick to the milestones. AI comes after trading works |

---

## 16. Name Options

| Name | Idea |
|---|---|
| **Levlr Terminal** ⭐ | Chosen name |
| **Helm** | "Take the helm". Control, premium, short |
| **Keel** | Stability. Risk control is the core value |
| **Sextant** | Precise navigation. Fits AI chart reading |
| **Zonely** | Built around your zones and levels |
| **Riskline** | Risk-first trading |

> Check domain availability and trademarks (especially "Levlr") before committing.

---

## 17. Immediate Next Steps

1. Open an **IC Markets cTrader demo** account.
2. Register an app on the **cTrader Open API** portal.
3. Apply for **TradingView Advanced Charts**.
4. Create the **Supabase** project and the **Turborepo** monorepo.
5. Build M1 (layout) while waiting for the approvals.
