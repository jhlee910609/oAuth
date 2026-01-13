import { NextRequest, NextResponse } from "next/server";

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. 제외 경로 설정 (인증 과정에 필요한 경로들은 통과시켜야 함)
  const publicPaths = [
    "/api/auth",       // 로그인/로그아웃/콜백 API (Server-Side Flow)
    "/api/oauth",      // Mock Provider API
    "/provider",       // Mock Provider 로그인 화면
    "/_next",          // 정적 리소스
    "/favicon.ico"     // 아이콘
  ];

  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // 2. 토큰 검사
  const sessionToken = req.cookies.get("session_token");
    
  if (!sessionToken) {
    // 3. 로그아웃 상태 -> OAuth Login 개시 (자동 Redirect)
    // 중간 페이지 없이 바로 서버 사이드 로그인 로직을 태웁니다.
    return NextResponse.redirect(new URL("/api/auth/signin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  // 모든 경로에 미들웨어 적용 (matcher를 넓게 잡고 코드에서 필터링하는 게 안전)
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
