// Calls the app's own backend (server/index.js). The Anthropic key stays
// on the server. The client sends a task id plus inputs; the server owns
// the prompt, the model, and max_tokens.
//
// EXPO_PUBLIC_KAZI_APP_KEY is the same value as server KAZI_APP_KEY. The
// EXPO_PUBLIC_ prefix inlines it into the binary, so it is an app gate,
// not a secret on par with the Anthropic key.
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';
const APP_KEY = process.env.EXPO_PUBLIC_KAZI_APP_KEY ?? '';
const DEVICE_STORAGE_KEY = 'kazi.deviceId';
const DEVICE_ID_RE = /^[A-Za-z0-9_-]{8,128}$/;

export type AITask =
  | 'cv_summary'
  | 'cv_score'
  | 'cover_letter'
  | 'application_letter'
  | 'interview_questions'
  | 'interview_feedback'
  | 'skills_gap'
  | 'career_coach';

export type AIInputs = Record<string, unknown>;

let deviceIdPromise: Promise<string> | null = null;

function randomDeviceId(): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let suffix = '';
  for (let i = 0; i < 24; i += 1) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `dev_${suffix}`;
}

async function getDeviceId(): Promise<string> {
  if (!deviceIdPromise) {
    deviceIdPromise = (async () => {
      try {
        const existing = await AsyncStorage.getItem(DEVICE_STORAGE_KEY);
        if (existing && DEVICE_ID_RE.test(existing)) return existing;
        const created = randomDeviceId();
        await AsyncStorage.setItem(DEVICE_STORAGE_KEY, created);
        return created;
      } catch {
        return randomDeviceId();
      }
    })();
  }
  return deviceIdPromise;
}

export async function callAI(task: AITask, inputs: AIInputs): Promise<string> {
  const deviceId = await getDeviceId();
  const res = await fetch(`${API_BASE}/api/ai/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${APP_KEY}`,
      'X-Device-Id': deviceId,
    },
    body: JSON.stringify({ task, inputs }),
  });
  if (!res.ok) {
    throw new Error(`AI request failed: ${res.status}`);
  }
  const data = await res.json();
  return data.content?.[0]?.text ?? '';
}
