import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * [CLIENT BFF] /api/auth/refresh
 * Silent Refresh 엔드포인트
 * 
 * HttpOnly 쿠키의 Refresh Token을 사용하여
 * 새로운 Access Token을 발급받아 JSON으로 내려줍니다. (쿠키 X)
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
     return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 1. HttpOnly 쿠키에서 Refresh Token 추출
  const refreshToken = req.cookies['refresh_token'];
  
  if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token' });
  }

  try {
    // 2. Provider에게 새 토큰 요청
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;
    const tokenEndpoint = `${protocol}://${host}/api/oauth/token`;

    console.log('[BFF] Silent Refresh: Requesting new Access Token...');
    
    const tokenResponse = await fetch(tokenEndpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            grant_type: "refresh_token",
            refresh_token: refreshToken,
            client_id: "practice-client-id",
            client_secret: "practice-client-secret",
        }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
        console.error('[BFF] Refresh Failed:', tokenData);
        return res.status(401).json(tokenData);
    }

    console.log('[BFF] Silent Refresh Success! Sending Access Token to Client Memory.');

    // 3. Access Token만 JSON으로 반환 (쿠키 굽기 X)
    return res.status(200).json({
        access_token: tokenData.access_token,
        expires_in: tokenData.expires_in
    });

  } catch (error) {
      console.error('[BFF] Silent Refresh Error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
  }
}
