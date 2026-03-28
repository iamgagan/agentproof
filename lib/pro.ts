import { currentUser } from '@clerk/nextjs/server';

export type UserPlan = 'free' | 'pro';

export async function getUserPlan(): Promise<UserPlan> {
  const user = await currentUser();
  if (!user) return 'free';

  const plan = (user.publicMetadata as Record<string, unknown>)?.plan;
  return plan === 'pro' ? 'pro' : 'free';
}

export async function isProUser(): Promise<boolean> {
  return (await getUserPlan()) === 'pro';
}
