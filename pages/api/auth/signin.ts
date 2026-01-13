import type { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';
import crypto from 'crypto';

/**
 * [CLIENT BFF] /api/auth/signin
 * PKCE (Proof Key for Code Exchange) Flow 적용
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. CSRF State 생성
  const state = Math.random().toString(36).substring(7);
  
  // 2. PKCE - Code Verifier 및 Challenge 생성
  // Verifier: 랜덤 문자열 (43~128자)
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  // Challenge: Verifier를 SHA256 해시 -> Base64Url 인코딩
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');

  // 3. State & Verifier 쿠키 설정 (HttpOnly)
  const stateCookie = serialize('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 300,
    sameSite: 'lax',
  });
  
  const verifierCookie = serialize('code_verifier', codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 300,
    sameSite: 'lax',
  });

  // 4. Provider URL 생성 (PKCE 파라미터 추가)
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host;
  const origin = `${protocol}://${host}`;
  
  const clientId = "practice-client-id";
  // 이제 Callback을 API Route가 직접 받습니다.
  const redirectUri = `${origin}/api/auth/callback`;
  
  const authUrl = new URL(`${origin}/api/oauth/authorize`);
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("state", state);
  
  // PKCE Parameters
  authUrl.searchParams.set("code_challenge", codeChallenge);
  authUrl.searchParams.set("code_challenge_method", "S256");

  // 5. 헤더 설정 & 리다이렉트
  res.setHeader('Set-Cookie', [stateCookie, verifierCookie]);
  res.redirect(authUrl.toString());
}
