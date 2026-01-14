import type { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

/**
 * [CLIENT BFF] /api/auth/callback
 * Authorization Code를 받아 Access Token으로 교환하고 세션을 맺는 역할
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('--- [BFF] Callback Flow Started ---');
  // 1. Query String에서 Authorization Code & State 추출
  const { code, state } = req.query;
  // 2. 쿠키에 저장해둔 검증용 데이터 추출
  const { oauth_state, code_verifier } = req.cookies;

  console.log(`[BFF] Received Code: ${code}`);
  console.log(`[BFF] Received State: ${state}`);
  console.log(`[BFF] Stored State: ${oauth_state}`);

  if (!code || !state || !oauth_state || !code_verifier) {
    console.error('[BFF] Error: Missing required parameters or cookies');
    return res.status(400).json({ error: "Missing required parameters or cookies" });
  }

  // 3. State 보안 검증 (CSRF 방지)
  if (state !== oauth_state) {
    console.error('[BFF] Error: State mismatch');
    return res.status(400).json({ error: "Invalid state. Possible CSRF attack." });
  }

  try {
    // 4. Token Endpoint 호출 (Server-to-Server 통신)
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;
    const tokenEndpoint = `${protocol}://${host}/api/oauth/token`;

    console.log(`[BFF] Requesting Tokens from: ${tokenEndpoint}`);
    const tokenResponse = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code: code,
        client_id: "practice-client-id",
        client_secret: "practice-client-secret",
        code_verifier: code_verifier,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
        console.error('[BFF] Token Exchange Failed:', tokenData);
        return res.status(400).json(tokenData);
    }

    console.log('[BFF] Token Exchange Success!');

    // 5. 토큰을 받아서 세션 쿠키로 굽기
    const { access_token, refresh_token, expires_in } = tokenData;

    // Access Token (세션용)
    const sessionCookie = serialize('session_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: expires_in, // 토큰 수명과 동일하게 설정
      sameSite: 'lax',
    });

    // Refresh Token (토큰 갱신용 - 더 길게 설정)
    const refreshCookie = serialize('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7일
      sameSite: 'lax',
    });

    // 임시 쿠키 정리 (State, Verifier 삭제)
    const clearStateCookie = serialize('oauth_state', '', { maxAge: -1, path: '/' });
    const clearVerifierCookie = serialize('code_verifier', '', { maxAge: -1, path: '/' });

    res.setHeader('Set-Cookie', [
      sessionCookie,
      refreshCookie,
      clearStateCookie,
      clearVerifierCookie
    ]);

    console.log('[BFF] Cookies Set. Redirecting to Dashboard.');
    console.log('--- [BFF] Callback Flow Finished ---');
    // 6. 로그인 성공! 메인 페이지로 이동
    res.redirect('/');
    
  } catch (error) {
    console.error("Token Exchange Error:", error);
    res.status(500).json({ error: "Internal Server Error during Token Exchange" });
  }
}
