export default () => ({
  port: parseInt(process.env.PORT ?? '3001', 10),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  encryptionKey: process.env.ENCRYPTION_KEY ?? '',
  supabase: {
    url: process.env.SUPABASE_URL ?? '',
    publishableKey: process.env.SUPABASE_PUBLISHABLE_KEY ?? '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  },
  ctrader: {
    clientId: process.env.SPOTWARE_CLIENT_ID ?? '',
    clientSecret: process.env.SPOTWARE_CLIENT_SECRET ?? '',
    redirectUri: process.env.SPOTWARE_REDIRECT_URI ?? 'http://localhost:3001/brokers/ctrader/callback',
  },
  ai: {
    liveTradingEnabled: process.env.AI_LIVE_TRADING === 'true',
  },
  valkeyUrl: process.env.VALKEY_URL ?? '',
});
