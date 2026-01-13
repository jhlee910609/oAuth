import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

/**
 * [MOCK OAUTH SERVER] /api/oauth/token
 * Page Router Version
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { grant_type, code, client_id, client_secret, code_verifier } = req.body;

  // 1. Validate Grant Type
  if (grant_type !== 'authorization_code') {
    return res.status(400).json({ error: 'unsupported_grant_type' });
  }

  // 2. Authorization Code 검증 (PKCE 포함)
  const codeData = (global as any).mockAuthCodes?.get(code);

  // 메모리에 없거나 만료된 코드인 경우
  if (!codeData) {
      // 기존 하드코딩 검증 로직은 제거하고, 엄격하게 저장된 코드만 허용
      return res.status(400).json({ error: 'invalid_grant', error_description: 'Invalid or expired Authorization Code' });
  }
  
  // 3. PKCE 검증
  if (codeData.code_challenge) {
      if (!code_verifier) {
          return res.status(400).json({ error: 'invalid_request', error_description: 'Missing code_verifier' });
      }

      // Verifier 해싱 (S256 기준)
      const calculatedChallenge = crypto.createHash('sha256').update(code_verifier).digest('base64url');
      
      if (calculatedChallenge !== codeData.code_challenge) {
          console.error(`[PKCE FAIL] Expected: ${codeData.code_challenge}, Got: ${calculatedChallenge}`);
          return res.status(400).json({ error: 'invalid_grant', error_description: 'PKCE Verification Failed' });
      }
      console.log(`[PKCE SUCCESS] Verifier matches Challenge.`);
  }

  // 4. 사용한 코드 파기 (Replay Attack 방지)
  (global as any).mockAuthCodes.delete(code);

  // 5. Validate Client Credentials
  if (codeData.client_id !== client_id || client_secret !== 'practice-client-secret') {
    return res.status(401).json({ error: 'invalid_client' });
  }

  // 4. Issue Access Token & Refresh Token
  const accessToken = 'mock_access_token_' + Math.random().toString(36).substring(7);
  const refreshToken = 'mock_refresh_token_' + Math.random().toString(36).substring(7);
    
  console.log(`[MOCK PROVIDER] Tokens Issued for Code: ${code}`);

  return res.status(200).json({
    access_token: accessToken,
    refresh_token: refreshToken,
    token_type: 'Bearer',
    expires_in: 30, // 30초 (테스트용)
    scope: 'read_profile'
  });
}
