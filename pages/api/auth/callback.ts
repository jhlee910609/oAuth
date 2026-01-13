import type { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

/**
 * [CLIENT BFF] /api/auth/callback
 * 
 * Provider로부터 Authorization Code를 받아오는 최종 목적지입니다.
 * Page Router(UI)가 아닌 API Route가 직접 Callback을 받습니다.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET 요청으로 Code와 State가 들어옵니다.
  const { code, state } = req.query;

  try {
    // 0. PKCE & CSRF 검증
    const savedState = req.cookies['oauth_state'];
    const codeVerifier = req.cookies['code_verifier'];
    
    if (!state || !savedState || state !== savedState) {
       return res.status(403).json({ error: "Invalid State (CSRF check failed)" });
    }

    if (!codeVerifier) {
        return res.status(403).json({ error: "Missing Code Verifier (PKCE failed)" });
    }

    // 1. 검증 완료된 쿠키들 삭제 설정 (일회용)
    const clearStateCookie = serialize('oauth_state', '', { maxAge: -1, path: '/' });
    const clearVerifierCookie = serialize('code_verifier', '', { maxAge: -1, path: '/' });

    // 2. 토큰 교환 요청 (Server-to-Server)
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;
    const origin = `${protocol}://${host}`;

    const tokenResponse = await fetch(`${origin}/api/oauth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grant_type: "authorization_code",
          code,
          code_verifier: codeVerifier, // PKCE 핵심: 원본 암호 전송
          client_id: "practice-client-id",
          client_secret: "practice-client-secret", 
        }),
      });
  
    const data = await tokenResponse.json();

    if (!tokenResponse.ok) {
      return res.status(tokenResponse.status).json(data);
    }

    // 3. Session Cookie 설정 (HttpOnly)
    // Access Token
    const accessCookie = serialize('session_token', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: data.expires_in || 3600,
      path: '/',
      sameSite: 'lax',
    });

    // Refresh Token
    const refreshCookie = serialize('refresh_token', data.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 86400 * 14, 
      path: '/',
      sameSite: 'lax',
    });

    // 4. 쿠키 설정 및 대시보드로 리다이렉트
    res.setHeader('Set-Cookie', [accessCookie, refreshCookie, clearStateCookie, clearVerifierCookie]);
    res.redirect('/'); // 성공 시 루트(대시보드)로 이동

  } catch (error) {
    console.error("BFF Callback Error:", error);
    return res.status(500).json({ error: "internal_server_error" });
  }
}
