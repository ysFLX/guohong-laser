import crypto from 'crypto';

type CartRecoveryPayload = {
  v: 1;
  reminderId: string;
  email: string;
  exp: number; // epoch ms
};

const getSecret = () => process.env.CART_RECOVERY_SECRET || process.env.NEXTAUTH_SECRET || '';

export function createCartRecoveryToken(params: {
  reminderId: string;
  email: string;
  expiresAtMs?: number;
}): string | null {
  const secret = getSecret();
  if (!secret) return null;

  const payload: CartRecoveryPayload = {
    v: 1,
    reminderId: params.reminderId,
    email: params.email,
    exp: params.expiresAtMs ?? Date.now() + 14 * 24 * 60 * 60 * 1000,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url');
  return `${payloadB64}.${signature}`;
}

export function verifyCartRecoveryToken(token: string): { reminderId: string; email: string } | null {
  const secret = getSecret();
  if (!secret) return null;

  const [payloadB64, signature] = token.split('.');
  if (!payloadB64 || !signature) return null;

  const expectedSignature = crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url');
  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSignature);
  if (sigBuf.length !== expectedBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8')) as unknown;
  } catch {
    return null;
  }

  if (!parsed || typeof parsed !== 'object') return null;
  const payload = parsed as Partial<CartRecoveryPayload>;

  if (payload.v !== 1) return null;
  if (typeof payload.reminderId !== 'string') return null;
  if (typeof payload.email !== 'string') return null;
  if (typeof payload.exp !== 'number') return null;
  if (Date.now() > payload.exp) return null;

  return { reminderId: payload.reminderId, email: payload.email };
}

