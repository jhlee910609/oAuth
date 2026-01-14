import type { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

/**
 * [CLIENT BFF] /api/auth/logout
 * 
 * 로그아웃은 단순히 쿠키를 만료(Max-Age=0)시켜서 브라우저가 삭제하게 만드는 것입니다.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 만료된 쿠키를 덮어쓰기하여 삭제 효과를 냅니다.
  const expiredLoggedIn = serialize('is_logged_in', '', {
    maxAge: -1,
    path: '/',
  });

  const expiredRefresh = serialize('refresh_token', '', {
    maxAge: -1,
    path: '/',
  });

  res.setHeader('Set-Cookie', [expiredLoggedIn, expiredRefresh]);
  
  return res.status(200).json({ success: true });
}
