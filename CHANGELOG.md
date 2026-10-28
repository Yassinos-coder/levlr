# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2026-10-28

### Added
- Full interface redesign with a futuristic look, built on Tailwind CSS and shadcn/ui, with light, dark and system themes.
- Shared UI library: dialogs, confirm dialogs, toasts, dropdowns, tooltips, panel empty and loading states.
- Toast notifications for sign-in, sign-out, broker connection and layout-save errors, and for account creation.
- Charting on TradingView's Lightweight Charts with a timeframe and indicator toolbar (SMA, EMA, volume), theme-aware colours and older-history loading.
- Order, position, stop loss and take profit lines drawn on the chart from the trading store.

### Changed
- Sign-in page, workspace header, docked panels and status bar restyled.
- Left and right panels are wider by default.

### Removed
- KLineCharts, replaced by Lightweight Charts.

## [0.2.1] - 2026-10-28

### Added
- Railway infrastructure defined as code in `.railway/railway.ts`: services, build and start commands, resource limits, healthchecks and a pre-deploy database migration step.

### Changed
- API now runs from source on Railway and applies database migrations before each deploy through a dedicated `db:deploy` script.
- Email sign-ups redirect back to the Levlr site instead of the project-wide default.

### Fixed
- API crashed on startup in production because the bundled build compiled decorators incorrectly.

## [0.2.0] - 2026-10-28

### Added
- Google sign-in and sign-up from the login screen.

## [0.1.1] - 2026-10-28

### Added
- Railway deployment: a `railway.ts` script that configures and deploys the `Levlr API` and `Levlr Frontend` services and wires their variables, with a Valkey cache service.
- Lightweight static server for the web app so the frontend runs on Railway without extra dependencies.

## [0.1.0] - 2026-10-28

### Added
- Turborepo monorepo on Bun with shared TypeScript configs and the product spec.
- Web terminal (React, Vite, Tailwind, Dockview) with a docked layout and default tabs per panel; layouts are saved to Supabase and cached locally.
- Email sign-in and sign-up through Supabase Auth.
- Candlestick chart behind a swappable chart adapter (KLineCharts, demo data until the broker feed lands).
- Bottom status bar showing live latency to the Levlr backend and to the cTrader server.
- NestJS API with health endpoint, typed config, Supabase JWT guard and request validation.
- Prisma data model in the `levlr` Postgres schema, with migrations, row level security and Data API grants.
- Valkey cache service that falls back to the source of truth when the cache is unreachable, plus persisted query caching in the web app.
- cTrader integration: OAuth connect flow with encrypted token storage, connection list endpoint, broker adapter (symbols, candles, quotes, orders, positions, execution events) and "Connect IC Markets" button.
- Risk package with risk-based position sizing and a minimum-lot warning.
- Broker core package defining the adapter interface shared by all brokers.
