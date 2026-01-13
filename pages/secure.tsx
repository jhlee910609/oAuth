import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";

interface Props {
  sessionToken: string;
  refreshToken: string;
}

export default function SecurePage({ sessionToken, refreshToken }: Props) {
  const handleLogout = async () => {
    // 1. BFF 로그아웃 호출 (쿠키 삭제)
    await fetch("/api/auth/logout", { method: "POST" });

    // 2. 로그인 페이지로 이동
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-slate-900 flex flex-col items-center justify-center p-6 font-sans">
      <Head>
        <title>인증 성공 | Dashboard</title>
      </Head>

      <div className="max-w-xl w-full animate-fade-in">
        <div className="text-center mb-12">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 animate-pulse"></div>
            <div className="relative w-24 h-24 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center shadow-xl shadow-emerald-500/20 transform hover:scale-110 transition-transform duration-700">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-950 mb-4">
            인증 성공!
          </h1>
          <p className="text-lg text-slate-500 font-medium">
            OAuth 2.0 Authorization Code Flow가
            <br />
            성공적으로 완료되었습니다.
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] p-10 border border-slate-200/60 shadow-[0_20px_50px_rgba(0,0,0,0.03)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-50 transition-colors duration-700"></div>

            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
              Access Token (1 Hour)
            </h3>
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 font-mono text-sm mb-8">
              <div className="text-slate-600 break-all leading-relaxed bg-white/50 p-4 rounded-xl border border-white">
                {sessionToken}
              </div>
            </div>

            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
              Refresh Token (2 Weeks)
            </h3>
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 font-mono text-sm">
              <div className="text-slate-600 break-all leading-relaxed bg-white/50 p-4 rounded-xl border border-white">
                {refreshToken}
              </div>
            </div>

            <div className="mt-8 flex items-start gap-3 bg-blue-50/50 p-5 rounded-2xl border border-blue-100/50">
              <div className="mt-1">
                <svg
                  className="w-4 h-4 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="text-xs text-blue-700 leading-relaxed font-medium">
                이 토큰은 브라우저의{" "}
                <span className="underline decoration-blue-300 font-bold">
                  JavaScript가 접근할 수 없는
                </span>{" "}
                보안 쿠키에 존재합니다. SSR(`getServerSideProps`)을 통해서만
                서버에서 읽어왔습니다.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center p-5 bg-white border border-slate-200 rounded-2xl hover:border-slate-400 hover:shadow-lg transition-all font-bold text-slate-600 active:scale-[0.98]"
            >
              새로고침 (상태 확인)
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center p-5 bg-slate-950 text-white rounded-2xl hover:bg-red-600 shadow-xl shadow-slate-900/20 hover:shadow-red-600/30 transition-all font-bold active:scale-[0.98] group"
            >
              <span className="group-hover:hidden">로그아웃</span>
              <span className="hidden group-hover:inline">
                세션 파기 및 연결 끊기
              </span>
            </button>
          </div>
          <p className="text-center text-xs text-slate-400 font-medium">
            로그아웃을 하지 않으면 세션(쿠키)은 유지됩니다.
          </p>
        </div>

        <footer className="mt-20 py-8 border-t border-slate-100 flex flex-col items-center gap-6 opacity-40 hover:opacity-100 transition-opacity duration-500">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
            Next.js Framework & Tailwind v4
          </p>
          <div className="flex gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-8 h-1 bg-slate-200 rounded-full"></div>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req } = context;
  const sessionToken = req.cookies["session_token"];
  const refreshToken = req.cookies["refresh_token"] || "No Refresh Token Found";

  if (!sessionToken) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return {
    props: {
      sessionToken,
      refreshToken,
    },
  };
};
