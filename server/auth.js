import { timingSafeEqual } from 'node:crypto';

const DEVICE_ID = /^[A-Za-z0-9_-]{8,128}$/;

function credentialsMatch(provided, expected) {
  const left = Buffer.from(provided);
  const right = Buffer.from(expected);
  if (left.length !== right.length) {
    timingSafeEqual(left, left);
    return false;
  }
  return timingSafeEqual(left, right);
}

// App credential (Authorization: Bearer) plus a per-install device id.
// Fail closed when the server has no app key configured.
export function requireAppDevice(appKey) {
  return function requireAppDeviceMiddleware(req, res, next) {
    if (!appKey) {
      return res.status(503).json({ error: 'App authentication is not configured.' });
    }
    const header = req.get('authorization') || '';
    const match = /^Bearer\s+(\S+)$/i.exec(header);
    const token = match ? match[1] : '';
    const deviceId = req.get('x-device-id') || '';
    if (!token || !credentialsMatch(token, appKey) || !DEVICE_ID.test(deviceId)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.deviceId = deviceId;
    return next();
  };
}
