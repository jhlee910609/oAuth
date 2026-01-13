import type { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

/**
 * [CLIENT BFF] /api/auth/login
 * Page Router Version
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, state } = req.body;

    // 0. CSRF State 검증 (BFF가 수행)
    const savedState = req.cookies['oauth_state'];
    
    if (!state || !savedState || state !== savedState) {
       return res.status(403).json({ error: "Invalid State (CSRF check failed)" });
    }

    // 검증 완료된 State 쿠키 삭제 (일회용)
    const clearStateCookie = serialize('oauth_state', '', {
        maxAge: -1,
        path: '/'
    });

    // 1. 토큰 교환 요청 (Server-to-Server)
    // [Pro Tip] 실무에서는 여기를 실제 회사의 백엔드 API 주소로 변경하면 됩니다.
    // 예: const tokenResponse = await fetch("https://api.company.com/oauth/token", { ... });
    
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;
    const origin = `${protocol}://${host}`;

    const tokenResponse = await fetch(`${origin}/api/oauth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grant_type: "authorization_code",
          code,
          client_id: "practice-client-id",
          client_secret: "practice-client-secret", // Server-side Only
        }),
      });
  
    const data = await tokenResponse.json();

    if (!tokenResponse.ok) {
      return res.status(tokenResponse.status).json(data);
    }

    // 2. Session Cookie 설정 (HttpOnly)
    // Access Token: 서버가 준 만료시간(expires_in)과 정확히 맞춤
    const accessCookie = serialize('session_token', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: data.expires_in || 3600, // 서버 값 사용 (없으면 1시간)
      path: '/',
      sameSite: 'lax',
    });

    // Refresh Token: 보통 Access Token보다 길게 잡음 (여기선 2주 고정)
    // 실무에선 'refresh_token_expires_in' 같은 값을 받아서 쓰기도 함
    const refreshCookie = serialize('refresh_token', data.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 86400 * 14, // 2 weeks
      path: '/',
      sameSite: 'lax',
    });

    res.setHeader('Set-Cookie', [accessCookie, refreshCookie, clearStateCookie]);
    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("BFF Error:", error);
    return res.status(500).json({ error: "internal_server_error" });
  }
}
