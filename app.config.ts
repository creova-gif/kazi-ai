// CRE-255: app.json ships no cleartext/ATS exceptions. This file only relaxes
// iOS ATS for LOCAL development builds (APP_VARIANT=development or EAS
// profile "development"), and only for local networking (localhost, *.local,
// unqualified LAN hosts) via NSAllowsLocalNetworking. It never sets
// the arbitrary-loads ATS key or the Android cleartext flag (guarded by
// server/ats-guard.test.js). Android debug builds already permit cleartext
// to the Metro/dev host through the RN debug manifest; release builds do not.
import type { ConfigContext, ExpoConfig } from 'expo/config';

const isDev =
  process.env.APP_VARIANT === 'development' || process.env.EAS_BUILD_PROFILE === 'development';

export default ({ config }: ConfigContext): ExpoConfig => {
  const base = config as ExpoConfig;
  if (!isDev) {
    // Non-dev builds must talk to the API over TLS.
    const api = process.env.EXPO_PUBLIC_API_BASE_URL;
    if (api && !api.startsWith('https://')) {
      throw new Error('EXPO_PUBLIC_API_BASE_URL must be https:// for non-development builds (CRE-255)');
    }
    return base;
  }
  return {
    ...base,
    ios: {
      ...base.ios,
      infoPlist: {
        ...(base.ios?.infoPlist ?? {}),
        NSAppTransportSecurity: { NSAllowsLocalNetworking: true },
      },
    },
  };
};
