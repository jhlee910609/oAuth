import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * [MOCK OAUTH SERVER] /api/oauth/authorize
 * 
 * 이제 이 엔드포인트는 바로 코드를 발급하지 않습니다.
 * 사용자가 "로그인" 상태인지 확인하고(여기선 생략), 
 * 로그인을 위해 'Provider의 로그인 페이지'로 토스합니다.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { client_id, redirect_uri, response_type, state, code_challenge, code_challenge_method } = req.query;

  // 1. 필수 파라미터 검증
  if (!client_id || !redirect_uri || response_type !== 'code') {
    return res.status(400).json({ error: 'missing_parameters' });
  }

  // 2. Provider 로그인 페이지로 Redirect
  // 이때, 원래 클라이언트가 요청했던 정보들을 쿼리 스트링으로 고스란히 넘겨줍니다.
  // 그래야 로그인 성공 후 다시 돌아갈 곳(redirect_uri)을 알 수 있으니까요.
  
  const providerLoginUrl = new URL('/provider/signin', `http://${req.headers.host}`);
  providerLoginUrl.searchParams.set('client_id', client_id as string);
  providerLoginUrl.searchParams.set('redirect_uri', redirect_uri as string);
  providerLoginUrl.searchParams.set('state', state as string || '');

  // PKCE 파라미터 전달
  if (code_challenge) {
      providerLoginUrl.searchParams.set('code_challenge', code_challenge as string);
      providerLoginUrl.searchParams.set('code_challenge_method', code_challenge_method as string || 'S256');
  }

  res.redirect(providerLoginUrl.toString());
}
