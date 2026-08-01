// Calls the app's own backend proxy (server/index.js) instead of
// api.anthropic.com directly, so the Anthropic API key never has to reach
// the client. Set EXPO_PUBLIC_API_BASE_URL for native builds pointed at a
// deployed server; leave it unset for local/web dev where the proxy is
// served from the same origin.
const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIRequest {
  model?: string;
  max_tokens: number;
  system?: string;
  messages: AIMessage[];
}

export async function callAI(request: AIRequest): Promise<string> {
  const res = await fetch(`${API_BASE}/api/ai/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    throw new Error(`AI request failed: ${res.status}`);
  }
  const data = await res.json();
  return data.content?.[0]?.text ?? '';
}
