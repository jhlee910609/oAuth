import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * [CLIENT BFF PROXY] /api/proxy/profile
 * 
 * 프론트엔드(Client)에서 호출하는 프록시 엔드포인트입니다.
 * 자바스크립트는 토큰(HttpOnly Cookie)을 볼 수 없지만, 
 * 이 API를 호출할 때는 브라우저가 자동으로 쿠키를 실어 보내줍니다.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('--- [BFF PROXY] Request Started ---');

  // 1. HttpOnly 쿠키에서 Access Token 꺼내기
  const sessionToken = req.cookies['session_token'];

  if (!sessionToken) {
    console.error('[BFF PROXY] Error: session_token cookie not found');
    return res.status(401).json({ error: 'No session token available' });
  }

  try {
    // 2. 외부 Resource Server URL 설정
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;
    const externalApiUrl = `${protocol}://${host}/api/resource/profile`;

    console.log(`[BFF PROXY] Forwarding request to External API with Token...`);

    // 3. 서버-투-서버 통신으로 토큰을 Header에 실어서 던짐 (BFF의 핵심!)
    const response = await fetch(externalApiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sessionToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
        console.error('[BFF PROXY] External API Error:', data);
        return res.status(response.status).json(data);
    }

    console.log('[BFF PROXY] Data received from External API and returning to Client.');
    console.log('--- [BFF PROXY] Request Finished ---');

    // 4. 외부 API의 결과를 프론트엔드에게 그대로 반환
    return res.status(200).json(data);

  } catch (error) {
    console.error('[BFF PROXY] Internal Error:', error);
    return res.status(500).json({ error: 'Internal Server Error in Proxy' });
  }
}
