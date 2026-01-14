import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * [MOCK RESOURCE SERVER] /api/resource/profile
 * 
 * 외부 서비스의 보호된 API를 시뮬레이션합니다.
 * 오직 유효한 Authorization Header (Bearer Token)가 있어야만 데이터를 반환합니다.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers['authorization'];

  console.log(`[RESOURCE SERVER] Request received with Header: ${authHeader}`);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('[RESOURCE SERVER] Access Denied: No Bearer Token');
    return res.status(401).json({ error: 'Unauthorized', message: 'Bearer token is missing' });
  }

  const token = authHeader.split(' ')[1];

  // Mock 인증: 토큰이 'mock_access_token_'으로 시작하는지만 확인
  if (!token.startsWith('mock_access_token_')) {
    console.error(`[RESOURCE SERVER] Access Denied: Invalid Token [${token}]`);
    return res.status(403).json({ error: 'Forbidden', message: 'Invalid access token' });
  }

  console.log(`[RESOURCE SERVER] Access Granted for Token: ${token.substring(0, 20)}...`);

  // 성공 시 보호된 데이터 반환
  return res.status(200).json({
    id: 'user_123',
    email: 'user@example.com',
    secret_data: '이 데이터는 외부 API 서버에서 가져온 아주 민감한 정보입니다! (BFF Proxy 성공)',
    timestamp: new Date().toISOString()
  });
}
