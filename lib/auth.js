import { currentUser } from '@clerk/nextjs/server';

/**
 * The signed-in user, taken from the Clerk session on the server. Never trust ids or emails
 * sent in a request body: those are whatever the caller wants them to be.
 */
export async function getSessionUser() {
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  if (!user || !email) return null;
  const name = user.fullName?.trim() || user.firstName || email.split('@')[0];
  return { id: user.id, email, name };
}
