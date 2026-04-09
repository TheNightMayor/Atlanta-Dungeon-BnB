import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/auth';
import { redirect } from 'next/navigation';

export default async function AuthRedirectPage() {
  const session = await getServerSession(authOptions as any);

  if (!session) {
    redirect('/');
  }

  const userId = (session.user as any)?.id ?? session.user?.name ?? session.user?.email ?? '';
  if (!userId) redirect('/');

  redirect(`/users/${encodeURIComponent(String(userId))}`);
}
