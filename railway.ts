import { existsSync, readFileSync } from 'node:fs';

type ServiceName = 'Levlr API' | 'Levlr Frontend';

interface ServiceConfig {
  buildCommand: string;
  startCommand: string;
  healthcheckPath?: string;
}

const SERVICE_CONFIG: Record<ServiceName, ServiceConfig> = {
  'Levlr API': {
    buildCommand: 'bunx turbo run build --filter=@levlr/api',
    startCommand: 'cd apps/api && bun run start',
    healthcheckPath: '/health',
  },
  'Levlr Frontend': {
    buildCommand: 'bunx turbo run build --filter=@levlr/web',
    startCommand: 'cd apps/web && bun run start',
  },
};

const API_ENV_KEYS = [
  'DATABASE_URL',
  'DIRECT_URL',
  'SUPABASE_URL',
  'SUPABASE_PUBLISHABLE_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ENCRYPTION_KEY',
  'SPOTWARE_CLIENT_ID',
  'SPOTWARE_CLIENT_SECRET',
];

const WEB_ENV_KEYS = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY'];

class Railway {
  static run(args: string[]): string {
    const result = Bun.spawnSync(['railway', ...args], { stdout: 'pipe', stderr: 'pipe' });
    if (result.exitCode !== 0) throw new Error(`railway ${args[0]} failed: ${result.stderr.toString().trim()}`);
    return result.stdout.toString();
  }

  static domains(): Record<string, string> {
    const services = JSON.parse(Railway.run(['service', 'list', '--json'])) as { name: string; url: string | null }[];
    return Object.fromEntries(services.filter((service) => service.url).map((service) => [service.name, service.url as string]));
  }

  static configure(service: ServiceName, config: ServiceConfig) {
    const entries: [string, string][] = [
      ['build.builder', 'RAILPACK'],
      ['build.buildCommand', config.buildCommand],
      ['deploy.startCommand', config.startCommand],
      ['deploy.numReplicas', '1'],
      ['deploy.restartPolicyType', 'ON_FAILURE'],
    ];
    if (config.healthcheckPath) entries.push(['deploy.healthcheckPath', config.healthcheckPath]);

    const flags = entries.flatMap(([path, value]) => ['--service-config', service, path, value]);
    Railway.run(['environment', 'edit', ...flags, '--message', `Configure ${service}`]);
  }

  static setVariables(service: ServiceName, variables: Record<string, string>) {
    const pairs = Object.entries(variables).map(([key, value]) => `${key}=${value}`);
    Railway.run(['variable', 'set', '--service', service, '--skip-deploys', ...pairs]);
  }

  static deploy(service: ServiceName, message: string) {
    Railway.run(['up', '--service', service, '--detach', '--ci', '-m', message]);
  }
}

class EnvFile {
  static pick(path: string, keys: string[]): Record<string, string> {
    if (!existsSync(path)) throw new Error(`Missing ${path}`);

    const values = new Map<string, string>();
    for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (match?.[1] && match[2] !== undefined) values.set(match[1], match[2].replace(/^"|"$/g, ''));
    }

    const missing = keys.filter((key) => !values.get(key));
    if (missing.length > 0) throw new Error(`${path} is missing: ${missing.join(', ')}`);
    return Object.fromEntries(keys.map((key) => [key, values.get(key) as string]));
  }
}

function main() {
  const domains = Railway.domains();
  const apiUrl = domains['Levlr API'];
  const webUrl = domains['Levlr Frontend'];
  if (!apiUrl || !webUrl) throw new Error('Generate a domain for both services first: railway domain --service <name>');

  Object.entries(SERVICE_CONFIG).forEach(([service, config]) => Railway.configure(service as ServiceName, config));

  Railway.setVariables('Levlr API', {
    ...EnvFile.pick('apps/api/.env', API_ENV_KEYS),
    VALKEY_URL: 'redis://${{valkey.RAILWAY_PRIVATE_DOMAIN}}:6379',
    CORS_ORIGIN: webUrl,
    SPOTWARE_REDIRECT_URI: `${apiUrl}/brokers/ctrader/callback`,
  });

  Railway.setVariables('Levlr Frontend', {
    ...EnvFile.pick('apps/web/.env', WEB_ENV_KEYS),
    VITE_API_URL: apiUrl,
  });

  if (process.argv.includes('--deploy')) {
    Railway.deploy('Levlr API', 'Deploy Levlr API');
    Railway.deploy('Levlr Frontend', 'Deploy Levlr Frontend');
  }

  console.log(`API: ${apiUrl}\nFrontend: ${webUrl}`);
}

main();
