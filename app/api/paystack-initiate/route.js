import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { jsonError, parseBody } from '@/lib/http';
import { initializeTransaction } from '@/lib/payments';
import { SITE_URL } from '@/lib/site';
import { TOKEN_PACKAGES } from '@/lib/tokenPackages';
import { packageInput } from '@/lib/validation';

export async function POST(request) {
  const user = await getSessionUser();
  if (!user) return jsonError('Unauthorized', 401);
  const { data, error } = await parseBody(request, packageInput);
  if (error) return error;

  try {
    const { authorizationUrl, reference } = await initializeTransaction({
      email: user.email,
      userId: user.id,
      pkg: TOKEN_PACKAGES[data.packageId],
      callbackUrl: `${SITE_URL}/workspace/buy-tokens`,
    });
    return NextResponse.json({ authorization_url: authorizationUrl, reference });
  } catch (err) {
    console.error('[paystack-initiate]', err.message);
    return jsonError('Could not start the payment. Please try again.', 502);
  }
}
