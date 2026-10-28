export default () => ({
  port: parseInt(process.env.PORT ?? '3001', 10),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  supabase: {
    url: process.env.SUPABASE_URL ?? '',
    publishableKey: process.env.SUPABASE_PUBLISHABLE_KEY ?? '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  },
  valkeyUrl: process.env.VALKEY_URL ?? '',
});
