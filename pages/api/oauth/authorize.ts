import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * [MOCK OAUTH SERVER] /api/oauth/authorize
 * 
 * 이제 이 엔드포인트는 바로 코드를 발급하지 않습니다.
 * 사용자가 "로그인" 상태인지 확인하고(여기선 생략), 
 * 로그인을 위해 'Provider의 로그인 페이지'로 토스합니다.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('--- [PROVIDER] Authorize Endpoint Called ---');
  const { client_id, redirect_uri, response_type, state, code_challenge, code_challenge_method } = req.query;

  console.log(`[PROVIDER] Client ID: ${client_id}`);
  console.log(`[PROVIDER] Redirect UI: ${redirect_uri}`);
  console.log(`[PROVIDER] PKCE Challenge: ${code_challenge}`);

  // 1. 필수 파라미터 검증
  if (!client_id || !redirect_uri || response_type !== 'code') {
    console.error('[PROVIDER] Error: Missing required OAuth parameters');
    return res.status(400).json({ error: 'missing_parameters' });
  }

  // 2. Client Login Page로 Redirect (Headless Pattern)
  // Mock Provider가 "로그인은 니네(Client)가 시켜라" 하고 클라이언트의 로그인 페이지로 보냅니다.
  // 이때도 역시 OAuth 파라미터들을 계속 전달해야 합니다.
  
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host;
  const clientLoginUrl = new URL('/login', `${protocol}://${host}`);
  clientLoginUrl.searchParams.set('client_id', client_id as string);
  clientLoginUrl.searchParams.set('redirect_uri', redirect_uri as string);
  clientLoginUrl.searchParams.set('state', state as string || '');

  // PKCE 파라미터 전달
  if (code_challenge) {
      clientLoginUrl.searchParams.set('code_challenge', code_challenge as string);
      clientLoginUrl.searchParams.set('code_challenge_method', code_challenge_method as string || 'S256');
  }

  console.log(`[PROVIDER] Delegating Login UI back to Client: ${clientLoginUrl.toString()}`);
  console.log('--- [PROVIDER] Authorization Delegated ---');

  res.redirect(clientLoginUrl.toString());
}
