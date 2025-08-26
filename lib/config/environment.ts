// Type-safe environment configuration
const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const config = {
  agno: {
    apiUrl: getEnvVar('NEXT_PUBLIC_AGNO_API_URL', 'http://localhost:18886'),
    agentId: getEnvVar('NEXT_PUBLIC_AGNO_AGENT_ID', 'atena'),
    endpointPath: getEnvVar('NEXT_PUBLIC_AGNO_ENDPOINT_PATH', '/agui'),
  },
  copilotKit: {
    runtimeUrl: getEnvVar('NEXT_PUBLIC_COPILOT_RUNTIME_URL', '/api/copilotkit'),
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY, // Optional, may not be needed
  }
} as const;

// Helper to construct the full Agno endpoint URL
export const getAgnoEndpointUrl = () => {
  return `${config.agno.apiUrl}${config.agno.endpointPath}`;
};