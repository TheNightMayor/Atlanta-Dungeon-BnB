import type { Session } from 'next-auth';

export function getSessionUserId(session: Session | null | undefined): string | null {
  if (!session?.user) return null;

  const id = (session.user as any)?.id;
  if (typeof id === 'string' && id.trim().length > 0) {
    return id;
  }

  const name = session.user.name;
  if (typeof name === 'string' && name.trim().length > 0) {
    return name;
  }

  return null;
}
