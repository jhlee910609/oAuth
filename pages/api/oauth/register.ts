import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * [MOCK OAUTH SERVER] /api/oauth/register
 * 
 * 회원가입 처리를 담당합니다.
 * 실제라면 DB에 저장하겠지만, 여기서는 메모리(global variable)에 저장합니다.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  // 글로벌 변수에 유저 저장
  if (!(global as any).mockUsers) {
    (global as any).mockUsers = new Map();
    // 기본 유저 추가
    (global as any).mockUsers.set('user', 'password'); 
  }

  if ((global as any).mockUsers.has(username)) {
      return res.status(409).json({ error: 'User already exists' });
  }

  (global as any).mockUsers.set(username, password);
  
  console.log(`[Provider] New User Registered: ${username}`);

  return res.status(201).json({ success: true });
}
