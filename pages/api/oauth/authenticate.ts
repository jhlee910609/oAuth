import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * [MOCK OAUTH SERVER] /api/oauth/authenticate
 * 
 * Provider 로그인 페이지에서 ID/PW를 받아 검증하고,
 * 맞다면 Authorization Code를 생성하여
 * Client의 redirect_uri로 보낼 최종 URL을 만들어줍니다.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('--- [PROVIDER] Authenticate API Called ---');
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password, client_id, redirect_uri, state, code_challenge, code_challenge_method } = req.body;
  console.log(`[PROVIDER] Attempting Login for User: ${username}`);

  if (!redirect_uri) {
      console.error('[PROVIDER] Error: Missing redirect_uri in request body');
      return res.status(400).json({ error: 'Missing redirect_uri parameter' });
  }

  // 1. ID/PW 검증 (Mock DB Usage)
  if (!(global as any).mockUsers) {
      (global as any).mockUsers = new Map();
      (global as any).mockUsers.set('user', 'password'); // Default User
  }

  const storedPassword = (global as any).mockUsers.get(username);

  if (!storedPassword || storedPassword !== password) {
    console.warn(`[PROVIDER] Login Failed: Invalid credentials for ${username}`);
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // 2. Authorization Code 생성 및 저장 (In-Memory)
  const authCode = 'mock_code_' + Math.random().toString(36).substring(7);
  
  // 글로벌 변수에 코드와 PKCE 정보 저장 (Token Endpoint에서 검증용)
  if (!(global as any).mockAuthCodes) {
      (global as any).mockAuthCodes = new Map();
  }
  
  (global as any).mockAuthCodes.set(authCode, {
      code_challenge,
      code_challenge_method,
      client_id,
      expiresAt: Date.now() + 60000 // 코드 유효기간 1분
  });

  console.log(`[PROVIDER] User ${username} Authenticated. Issued Code: ${authCode}`);
  if (code_challenge) console.log(`[PROVIDER] PKCE Challenge Stored for Code: ${authCode}`);

  // 3. Client Callback URL 조립
  const targetUrl = new URL(redirect_uri);
  targetUrl.searchParams.set('code', authCode);
  if (state) targetUrl.searchParams.set('state', state);

  console.log(`[PROVIDER] Returning Redirect URL: ${targetUrl.toString()}`);
  console.log('--- [PROVIDER] Authentication Logic Finished ---');

  // 4. Client에게 "이리로 이동하세요" 라고 응답
  return res.status(200).json({ redirect_to: targetUrl.toString() });
}
