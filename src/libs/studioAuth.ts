export async function hasSanityStudioSession(req: Request) {
  const authorization = req.headers.get('authorization');
  if (authorization?.startsWith('Bearer ')) {
    const token = authorization.replace(/^Bearer\s+/, '').trim();
    if (token && token === process.env.SANITY_STUDIO_TOKEN) return true;
    try {
      const response = await fetch('https://api.sanity.io/v2021-06-07/users/me', {
        headers: { Authorization: authorization },
      });
      if (response.ok) return true;
    } catch (error) {
      console.error('Unable to validate Sanity Studio user:', error);
    }
  }

  const cookieHeader = req.headers.get('cookie');
  if (cookieHeader) {
    try {
      const response = await fetch('https://api.sanity.io/v2021-06-07/users/me', {
        headers: { Cookie: cookieHeader },
      });
      if (response.ok) return true;
    } catch (error) {
      console.error('Unable to validate Sanity cookie user:', error);
    }
  }

  return false;
}
