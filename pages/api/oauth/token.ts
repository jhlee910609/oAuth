import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * [MOCK OAUTH SERVER] /api/oauth/token
 * Page Router Version
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { grant_type, code, client_id, client_secret } = req.body;

  // 1. Validate Grant Type
  if (grant_type !== 'authorization_code') {
    return res.status(400).json({ error: 'unsupported_grant_type' });
  }

  // 2. Validate Client Credentials
  if (client_id !== 'practice-client-id' || client_secret !== 'practice-client-secret') {
    return res.status(401).json({ error: 'invalid_client' });
  }

  // 3. Validate Code
  if (!code || !(code as string).startsWith('mock_code_')) {
    return res.status(400).json({ error: 'invalid_grant' });
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
