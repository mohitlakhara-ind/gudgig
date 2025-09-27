let paypalSdk = null;

export function isPaypalEnabled() {
  return process.env.ENABLE_PAYPAL === 'true' && !!process.env.PAYPAL_CLIENT_ID && !!process.env.PAYPAL_CLIENT_SECRET;
}

export async function getPaypalClient() {
  if (!isPaypalEnabled()) return null;
  if (!paypalSdk) {
    // Lazy import
    // eslint-disable-next-line global-require
    paypalSdk = require('@paypal/checkout-server-sdk');
  }
  const environment = process.env.PAYPAL_ENV === 'live'
    ? new paypalSdk.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
    : new paypalSdk.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);
  return new paypalSdk.core.PayPalHttpClient(environment);
}

export async function createOrder(amount, currency = 'USD', returnUrl, cancelUrl) {
  const client = await getPaypalClient();
  if (!client) throw new Error('PayPal is not enabled');
  const request = new paypalSdk.orders.OrdersCreateRequest();
  request.prefer('return=representation');
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{ amount: { currency_code: currency, value: String(amount) } }],
    application_context: { return_url: returnUrl, cancel_url: cancelUrl }
  });
  const order = await client.execute(request);
  return order.result;
}

export async function captureOrder(orderId) {
  const client = await getPaypalClient();
  if (!client) throw new Error('PayPal is not enabled');
  const request = new paypalSdk.orders.OrdersCaptureRequest(orderId);
  request.requestBody({});
  const capture = await client.execute(request);
  return capture.result;
}


