import { defineRailway, github, image, preserve, project, service } from "railway/iac";

const REGION = "europe-west4-drams3a";
const IN_REGION = { [REGION]: 1 };
const MB = 1_000_000;

const SHARED_NODE_FILES = ["/bun.lock", "/package.json", "/turbo.json"];

const watching = (buildCommand: string, ...paths: string[]) => ({
  buildCommand,
  watchPatterns: [...paths, ...SHARED_NODE_FILES],
});

const limits = (cpu: number, memoryBytes: number) => ({
  limitOverride: { containers: { cpu, memoryBytes } },
});

const bunStart = (appDirectory: string, entry: string) => `cd ${appDirectory} && exec bun ${entry}`;

const VALKEY_START =
  '/bin/sh -c "exec docker-entrypoint.sh valkey-server --maxmemory 64mb --maxmemory-policy allkeys-lru --save \'\'"';

export default defineRailway(() => {
  const repo = github("Yassinos-coder/levlr", { branch: "main", checkSuites: false });

  const cache = service("valkey", {
    source: image("valkey/valkey:8-alpine"),
    replicas: IN_REGION,
    start: VALKEY_START,
    deploy: limits(1, 128 * MB),
  });

  const frontend = service("Levlr Frontend", {
    source: repo,
    build: watching("bun run --filter @levlr/web build", "/apps/web/**"),
    start: bunStart("apps/web", "server.ts"),
    replicas: IN_REGION,
    deploy: limits(1, 256 * MB),
    networking: { privateNetworkEndpoint: "levlr-frontend" },
    env: { VITE_API_URL: preserve(), VITE_SUPABASE_PUBLISHABLE_KEY: preserve(), VITE_SUPABASE_URL: preserve() },
  });

  const backend = service("Levlr API", {
    source: repo,
    build: watching(
      "bun run --filter @levlr/api build",
      "/apps/api/**",
      "/packages/broker-core/**",
      "/packages/broker-ctrader/**",
      "/packages/risk/**",
      "/packages/config/**",
    ),
    start: bunStart("apps/api", "src/main.ts"),
    preDeploy: "bun run --filter @levlr/api db:deploy",
    healthcheck: "/health",
    healthcheckTimeout: 60,
    replicas: IN_REGION,
    deploy: limits(1, 512 * MB),
    networking: { privateNetworkEndpoint: "levlr-api" },
    env: {
      CORS_ORIGIN: preserve(),
      DATABASE_URL: preserve(),
      DIRECT_URL: preserve(),
      ENCRYPTION_KEY: preserve(),
      SPOTWARE_CLIENT_ID: preserve(),
      SPOTWARE_CLIENT_SECRET: preserve(),
      SPOTWARE_REDIRECT_URI: preserve(),
      SUPABASE_PUBLISHABLE_KEY: preserve(),
      SUPABASE_SERVICE_ROLE_KEY: preserve(),
      SUPABASE_URL: preserve(),
      VALKEY_URL: preserve(),
    },
  });

  return project("Levlr Terminal", {
    variables: { managed: true },
    resources: [cache, frontend, backend],
  });
});
