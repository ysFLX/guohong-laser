import crypto from 'node:crypto';

function requireEnv(name: string) {
  const value = (process.env[name] || '').trim();
  if (!value) {
    throw new Error(`${name} missing`);
  }
  return value;
}

function asBase64Json(value: unknown) {
  return Buffer.from(JSON.stringify(value), 'utf8').toString('base64');
}

function hmacBase64(payload: string, key: string) {
  return crypto.createHmac('sha256', key).update(payload).digest('base64');
}

export function getPaytrConfig() {
  const merchantId = requireEnv('PAYTR_MERCHANT_ID');
  const merchantKey = requireEnv('PAYTR_MERCHANT_KEY');
  const merchantSalt = requireEnv('PAYTR_MERCHANT_SALT');
  const testMode = process.env.PAYTR_TEST_MODE === '1' ? '1' : '0';
  const debugOn = process.env.PAYTR_DEBUG_ON === '1' ? '1' : '0';
  const noInstallment = process.env.PAYTR_NO_INSTALLMENT === '1' ? '1' : '0';
  const maxInstallment = (process.env.PAYTR_MAX_INSTALLMENT || '0').trim() || '0';
  const timeoutLimit = (process.env.PAYTR_TIMEOUT_LIMIT || '30').trim() || '30';
  return {
    merchantId,
    merchantKey,
    merchantSalt,
    testMode,
    debugOn,
    noInstallment,
    maxInstallment,
    timeoutLimit,
    currency: 'TL',
  };
}

export function getUserIp(req: Request) {
  const forwarded = req.headers.get('x-forwarded-for') || '';
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return req.headers.get('x-real-ip') || '127.0.0.1';
}

export function buildPaytrCheckoutPayload(params: {
  merchantOid: string;
  userIp: string;
  email: string;
  paymentAmount: number;
  userBasket: Array<[string, string, number]>;
  userName: string;
  userAddress: string;
  userPhone: string;
  merchantOkUrl: string;
  merchantFailUrl: string;
}) {
  const config = getPaytrConfig();
  const hashStr =
    config.merchantId +
    params.userIp +
    params.merchantOid +
    params.email +
    String(params.paymentAmount) +
    asBase64Json(params.userBasket) +
    config.noInstallment +
    config.maxInstallment +
    config.currency +
    config.testMode;
  const paytrToken = hmacBase64(hashStr + config.merchantSalt, config.merchantKey);

  const form = new URLSearchParams();
  form.set('merchant_id', config.merchantId);
  form.set('user_ip', params.userIp);
  form.set('merchant_oid', params.merchantOid);
  form.set('email', params.email);
  form.set('payment_amount', String(params.paymentAmount));
  form.set('paytr_token', paytrToken);
  form.set('user_basket', asBase64Json(params.userBasket));
  form.set('debug_on', config.debugOn);
  form.set('no_installment', config.noInstallment);
  form.set('max_installment', config.maxInstallment);
  form.set('user_name', params.userName);
  form.set('user_address', params.userAddress);
  form.set('user_phone', params.userPhone);
  form.set('merchant_ok_url', params.merchantOkUrl);
  form.set('merchant_fail_url', params.merchantFailUrl);
  form.set('timeout_limit', config.timeoutLimit);
  form.set('currency', config.currency);
  form.set('test_mode', config.testMode);
  return form;
}

export function buildPaytrRedirectUrl(token: string) {
  return `https://www.paytr.com/odeme/guvenli/${encodeURIComponent(token)}`;
}

export function verifyPaytrCallbackHash(params: { merchantOid: string; status: string; totalAmount: string; hash: string }) {
  const config = getPaytrConfig();
  const payload = params.merchantOid + config.merchantSalt + params.status + params.totalAmount;
  const expected = hmacBase64(payload, config.merchantKey);
  return expected === params.hash;
}
