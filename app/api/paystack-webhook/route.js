// app/api/paystack-webhook/route.js
import { NextResponse } from 'next/server';
import crypto from 'crypto'; // Node.js crypto module for signature verification
import { db } from '@/config/db';
import { usersTable, tokenTransactionsTable } from '@/config/schema';
import { eq } from 'drizzle-orm';

// Disable body parsing for this route, as Paystack sends raw body
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  // Use your main Paystack Secret Key for webhook verification
  const secret = process.env.PAYSTACK_SECRET_KEY; 
  const signature = req.headers.get('x-paystack-signature');

  if (!signature) {
    console.error('No Paystack signature found in headers.');
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  const rawBody = await req.text(); // Get the raw body as text

  // Verify the webhook signature
  const hash = crypto.createHmac('sha512', secret) // Use the main secret key here
    .update(rawBody)
    .digest('hex');

  if (hash !== signature) {
    console.error('Paystack webhook signature verification failed.');
    return NextResponse.json({ error: 'Signature verification failed' }, { status: 400 });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch (parseError) {
    console.error('Failed to parse Paystack webhook body:', parseError);
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Handle the event
  switch (event.event) {
    case 'charge.success':
      const data = event.data;
      console.log('Paystack Charge Success Event:', data.reference);

      // Extract metadata (sent during initialization)
      const userId = data.metadata?.userId;
      const tokenAmount = parseInt(data.metadata?.tokenAmount, 10);
      const transactionRef = data.reference; // Paystack transaction reference

      if (!userId || isNaN(tokenAmount)) {
        console.error('Missing userId or tokenAmount in metadata for transaction:', transactionRef);
        return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
      }

      try {
        // IMPORTANT: Verify the transaction status with Paystack's API
        // This is a crucial step to prevent fraud.
        const verificationResponse = await fetch(`https://api.paystack.co/transaction/verify/${transactionRef}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },
        });
        const verificationData = await verificationResponse.json();

        if (!verificationResponse.ok || !verificationData.status || verificationData.data.status !== 'success') {
          console.error('Paystack transaction verification failed for reference:', transactionRef, verificationData);
          return NextResponse.json({ error: 'Transaction verification failed' }, { status: 400 });
        }

        // Find the user in your database
        const [dbUser] = await db.select()
          .from(usersTable)
          .where(eq(usersTable.subID, userId)); // Assuming subID is Clerk's user.id

        if (!dbUser) {
          console.error('User not found in DB for userId:', userId);
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check if this transaction has already been processed (idempotency)
        const [existingTransaction] = await db.select()
          .from(tokenTransactionsTable)
          .where(eq(tokenTransactionsTable.transactionId, transactionRef));

        if (existingTransaction) {
          console.warn('Duplicate webhook event received for transaction:', transactionRef);
          return NextResponse.json({ received: true, message: 'Transaction already processed' });
        }

        // Update user's token balance
        const updatedTokens = dbUser.tokens + tokenAmount;
        await db.update(usersTable)
          .set({ tokens: updatedTokens })
          .where(eq(usersTable.id, dbUser.id));

        // Record the transaction
        await db.insert(tokenTransactionsTable).values({
          userId: dbUser.id,
          type: 'purchase',
          amount: tokenAmount,
          timestamp: new Date().toISOString(),
          transactionId: transactionRef, // Store Paystack reference
        });

        console.log(`Successfully awarded ${tokenAmount} tokens to user ${userId} for transaction ${transactionRef}`);
      } catch (dbError) {
        console.error('Database update error in Paystack webhook:', dbError);
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
      }
      break;
    default:
      console.log(`Unhandled Paystack event type ${event.event}`);
  }

  // Acknowledge receipt of the event
  return NextResponse.json({ received: true });
}
