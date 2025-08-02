// app/api/paystack-initiate/route.js
import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/config/db'; // Assuming your Drizzle DB instance
import { usersTable } from '@/config/schema'; // Assuming your usersTable schema
import { eq } from 'drizzle-orm';

// Define your token packages
// Amount in Kobo (smallest currency unit), so multiply KES by 100
const TOKEN_PACKAGES = {
  'single': { tokens: 1, price: 50, name: '1 Token', amount_kobo: 50 * 100 },
  'starter': { tokens: 3, price: 100, name: '3 Tokens (Starter)', amount_kobo: 100 * 100 },
  'pro': { tokens: 10, price: 250, name: '10 Tokens (Pro)', amount_kobo: 250 * 100 },
  'master': { tokens: 30, price: 500, name: '30 Tokens (Master)', amount_kobo: 500 * 100 },
};

export async function POST(req) {
  const { packageId } = await req.json();
  const user = await currentUser();

  if (!user || !user.id || !user.primaryEmailAddress?.emailAddress) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const selectedPackage = TOKEN_PACKAGES[packageId];

  if (!selectedPackage) {
    return NextResponse.json({ error: 'Invalid token package selected' }, { status: 400 });
  }

  const { tokens, amount_kobo, name } = selectedPackage;
  const userEmail = user.primaryEmailAddress.emailAddress;
  const userId = user.id; // Clerk user ID

  try {
    // Generate a unique reference for Paystack
    const reference = `kamusi_token_${userId}_${Date.now()}`;

    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: userEmail,
        amount: amount_kobo, // amount in kobo
        currency: 'KES', // Kenyan Shilling
        reference: reference,
        // The callback_url is where Paystack redirects the user after payment attempt
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/workspace/buy-tokens?status=success&tokens=${tokens}&reference=${reference}`,
        metadata: {
          userId: userId,
          tokenAmount: tokens,
          packageId: packageId,
        },
      }),
    });

    const data = await paystackResponse.json();

    if (!paystackResponse.ok || !data.status) {
      console.error('Paystack Initialization Error:', data);
      return NextResponse.json(
        { error: data.message || 'Failed to initialize payment with Paystack.' },
        { status: paystackResponse.status }
      );
    }

    // Return the authorization URL for the frontend to redirect
    return NextResponse.json({
      authorization_url: data.data.authorization_url,
      access_code: data.data.access_code, // access_code is useful if using inline popup
      reference: data.data.reference,
    });

  } catch (error) {
    console.error('Error initializing Paystack payment:', error);
    return NextResponse.json(
      { error: 'Failed to initiate payment. Please try again.' },
      { status: 500 }
    );
  }
}
