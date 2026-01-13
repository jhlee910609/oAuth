import { useRouter } from "next/router";
import { useEffect } from "react";
import Head from "next/head";

export default function CallbackPage() {
  const router = useRouter();

  const processLogin = async (code: string, state: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, state }), // State도 같이 보냄
      });

      if (response.ok) {
        setTimeout(() => {
          // SSR 페이지에서 쿠키를 확실히 읽을 수 있도록 Hard Redirect 사용
          window.location.href = "/";
        }, 800);
      } else {
        console.error("Login failed at BFF");
      }
    } catch (err) {
      console.error("Error during token exchange", err);
    }
  };

  useEffect(() => {
    if (!router.isReady) return;

    const { code, state } = router.query;

    // 이제 클라이언트에서 쿠키를 검사하지 않습니다 (HttpOnly라 못 읽음).
    // code와 state를 그대로 BFF로 넘기고, BFF가 쿠키와 대조하여 검증합니다.
    if (code && state) {
      processLogin(code as string, state as string);
    }
  }, [router.isReady, router.query]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white font-sans">
      <Head>
        <title>인증 처리 중...</title>
      </Head>

      <div className="relative mb-8">
        <div className="w-20 h-20 border-[3px] border-blue-500/20 border-t-white rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">보안 인증 완료 중</h2>
        <p className="text-slate-400 text-sm">
          인가 코드를 액세스 토큰으로 교환하고 있습니다...
        </p>
      </div>

      <div className="mt-12 flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 bg-slate-700 rounded-full animate-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          ></div>
        ))}
      </div>
    </div>
  );
}
