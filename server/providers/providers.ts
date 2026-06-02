import type { ApiKeys, ProviderConfig, ProviderDetails } from './types';

// ============================================================
// Provider Registry
// ============================================================

export const PROVIDER_REGISTRY: Record<string, ProviderConfig> = {
  gemini: {
    modelPrefix: 'gemini',
    defaultEndpoint: '', // Gemini uses the SDK, not a raw endpoint
    apiKeyEnvVar: 'GEMINI_API_KEY',
    extractModel: (model) => model,
  },
  openrouter: {
    prefix: 'openrouter/',
    defaultEndpoint: 'https://openrouter.ai/api/v1/chat/completions',
    apiKeyEnvVar: 'OPENROUTER_API_KEY',
    extractModel: (model) => model.substring(11),
  },
  openai: {
    modelPrefix: 'gpt-',
    defaultEndpoint: 'https://api.openai.com/v1/chat/completions',
    apiKeyEnvVar: 'OPENAI_API_KEY',
    extractModel: (model) => model,
  },
  deepseek: {
    modelPrefix: 'deepseek-',
    defaultEndpoint: 'https://api.deepseek.com/chat/completions',
    apiKeyEnvVar: 'DEEPSEEK_API_KEY',
    extractModel: (model) => model,
  },
  anthropic: {
    modelPrefix: 'claude-',
    defaultEndpoint: 'https://api.anthropic.com/v1/messages',
    apiKeyEnvVar: 'ANTHROPIC_API_KEY',
    extractModel: (model) => model,
  },
  azure: {
    prefix: 'azure/',
    defaultEndpoint: '', // Must be configured via environment
    apiKeyEnvVar: 'AZURE_API_KEY',
    extractModel: (model) => {
      const clean = model.substring(6);
      return clean === 'ai' ? (process.env.AZURE_MODEL_NAME || 'DeepSeek-V4-Pro') : clean;
    },
  },
  local: {
    prefix: 'local/',
    defaultEndpoint: 'http://127.0.0.1:11434/v1/chat/completions',
    apiKeyEnvVar: undefined, // local uses a hardcoded key
    extractModel: (model) => model.substring(6),
  },
};

// ============================================================
// Provider Detection
// ============================================================

export function detectProvider(model: string): { provider: string; cleanModel: string } {
  // 1. Check explicit prefixes
  for (const [name, config] of Object.entries(PROVIDER_REGISTRY)) {
    if (config.prefix && model.startsWith(config.prefix)) {
      return { provider: name, cleanModel: config.extractModel(model) };
    }
  }

  // 2. Check model name patterns
  for (const [name, config] of Object.entries(PROVIDER_REGISTRY)) {
    if (config.modelPrefix && model.startsWith(config.modelPrefix)) {
      return { provider: name, cleanModel: config.extractModel(model) };
    }
  }

  // 3. Fallback: if model contains a slash, treat first segment as provider
  if (model.includes('/')) {
    const parts = model.split('/');
    const possibleProvider = parts[0].toLowerCase();
    if (possibleProvider in PROVIDER_REGISTRY) {
      return {
        provider: possibleProvider,
        cleanModel: parts.slice(1).join('/'),
      };
    }
  }

  throw new Error(
    `Unable to detect provider for model "${model}". Supported providers: ${Object.keys(PROVIDER_REGISTRY).join(', ')}.`
  );
}

// ============================================================
// Credential Resolution
// ============================================================

export function resolveProviderDetails(
  provider: string,
  cleanModel: string,
  apiKeys?: ApiKeys
): ProviderDetails {
  const config = PROVIDER_REGISTRY[provider];
  if (!config) {
    throw new Error(`Unknown provider: ${provider}`);
  }

  let apiKey: string;
  if (provider === 'local') {
    apiKey = 'ollama';
  } else {
    const keyFromArgs = apiKeys?.[provider as keyof ApiKeys];
    const keyFromEnv = config.apiKeyEnvVar ? process.env[config.apiKeyEnvVar] : undefined;
    apiKey = keyFromArgs || keyFromEnv || '';

    if (!apiKey && provider !== 'azure') {
      const envVarName = config.apiKeyEnvVar || `${provider.toUpperCase()}_API_KEY`;
      throw new Error(`API key not configured for provider "${provider}". Set the ${envVarName} environment variable or pass it via apiKeys.`);
    }
  }

  let endpoint: string;
  if (provider === 'azure') {
    endpoint = process.env.AZURE_API_ENDPOINT || '';
    if (!endpoint) {
      throw new Error('Azure endpoint not configured. Set the AZURE_API_ENDPOINT environment variable.');
    }
    const apiPath = process.env.AZURE_API_PATH || '/chat/completions';
    if (!endpoint.includes(apiPath)) {
      try {
        const urlObj = new URL(endpoint);
        urlObj.pathname = urlObj.pathname.replace(/\/$/, '') + apiPath;
        endpoint = urlObj.toString();
      } catch (e) {
        endpoint = endpoint.replace(/\/$/, '') + apiPath;
      }
    }
  } else {
    endpoint = config.defaultEndpoint;
  }

  return { provider, cleanModel, apiKey, endpoint };
}

export function getProviderDetails(model: string, apiKeys?: ApiKeys): ProviderDetails {
  const { provider, cleanModel } = detectProvider(model);
  return resolveProviderDetails(provider, cleanModel, apiKeys);
}
