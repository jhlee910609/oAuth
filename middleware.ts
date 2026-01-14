import { NextRequest, NextResponse } from "next/server";

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. 토큰 검사 (가장 먼저 수행)
  const sessionToken = req.cookies.get("session_token");

  // [Check 1] 이미 로그인 된 유저가 로그인 페이지에 오면 -> 메인으로 보냄
  if (sessionToken && pathname === '/login') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // 2. 제외 경로 설정 (인증 과정에 필요한 경로들은 통과시켜야 함)
  const publicPaths = [
    "/api/auth",       // 로그인/로그아웃/콜백 API (Server-Side Flow)
    "/api/oauth",      // Mock Provider API
    "/login",          // Client Custom Login UI
    "/_next",          // 정적 리소스
    "/favicon.ico"     // 아이콘
  ];

  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }
    
  // [Check 2] 토큰이 없으면 로그인 시작
  if (!sessionToken) {
    return NextResponse.redirect(new URL("/api/auth/signin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  // 모든 경로에 미들웨어 적용 (matcher를 넓게 잡고 코드에서 필터링하는 게 안전)
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
