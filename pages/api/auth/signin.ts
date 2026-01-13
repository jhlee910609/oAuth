import type { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

/**
 * [CLIENT BFF] /api/auth/signin
 * 
 * 로그인 과정을 서버 사이드에서 시작합니다.
 * 1. State 생성 및 쿠키 설정 (HttpOnly)
 * 2. Provider의 Authorize URL 생성
 * 3. 302 Redirect 응답
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. CSRF State 생성
  const state = Math.random().toString(36).substring(7);

  // 2. State 쿠키 설정 (HttpOnly로 보안 강화!)
  const stateCookie = serialize('oauth_state', state, {
    httpOnly: true, // JS 접근 불가 -> 더 안전함
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 300, // 5분
    sameSite: 'lax',
  });

  // 3. Provider URL 생성
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host;
  const origin = `${protocol}://${host}`;
  
  const clientId = "practice-client-id";
  const redirectUri = `${origin}/login/callback`;
  
  const authUrl = new URL(`${origin}/api/oauth/authorize`);
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("state", state);

  // 4. 헤더 설정 & 리다이렉트
  res.setHeader('Set-Cookie', stateCookie);
  res.redirect(authUrl.toString());
}
