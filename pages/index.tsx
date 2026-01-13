import Link from "next/link";
import Head from "next/head";
import { GetServerSideProps } from "next";

interface Props {
  sessionToken?: string;
  refreshToken?: string;
}

export default function Dashboard({ sessionToken, refreshToken }: Props) {
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.reload(); // 미들웨어가 알아서 로그인 페이지로 보냄
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Head>
        <title>Dashboard | Mock OAuth</title>
      </Head>

      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            M
          </div>
          <span className="font-bold text-xl tracking-tight">MockApp</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-gray-500">
              Live Session
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 lg:p-10">
        <header className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Welcome Back!</h1>
          <p className="text-gray-500">
            OAuth 2.0 인증을 통해 안전하게 접속되었습니다.
          </p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">
              Session Duration
            </h3>
            <p className="text-2xl font-bold">59m 30s</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">
              Auth Method
            </h3>
            <p className="text-2xl font-bold">OAuth 2.0</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                ></path>
              </svg>
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">
              Token Status
            </h3>
            <p className="text-2xl font-bold text-emerald-600">Active</p>
          </div>
        </div>

        {/* Token Information Section */}
        <section className="bg-slate-900 text-slate-300 rounded-[2rem] p-8 border border-slate-800 shadow-xl overflow-hidden relative mb-10">
          <div className="absolute top-0 right-0 p-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

          <h2 className="text-white text-xl font-bold mb-6 flex items-center gap-3">
            <svg
              className="w-5 h-5 text-emerald-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              ></path>
            </svg>
            Secure Token Data
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-3">
                Access Token
              </h3>
              <div className="bg-black/30 rounded-xl p-4 font-mono text-xs break-all leading-relaxed border border-white/5 hover:border-white/10 transition-colors h-32 overflow-y-auto custom-scrollbar">
                {sessionToken || "Not Available"}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-3">
                Refresh Token
              </h3>
              <div className="bg-black/30 rounded-xl p-4 font-mono text-xs break-all leading-relaxed border border-white/5 hover:border-white/10 transition-colors h-32 overflow-y-auto custom-scrollbar">
                {refreshToken || "Not Available"}
              </div>
            </div>
          </div>

          <p className="mt-6 text-xs text-slate-500 flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            Server-Side Rendered (HttpOnly Cookie Access)
          </p>
        </section>

        {/* Quick Actions */}
        <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/secure"
            className="group p-5 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:ring-1 hover:ring-blue-500 transition-all text-left"
          >
            <div className="mb-3 w-8 h-8 bg-gray-100 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors flex items-center justify-center">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                ></path>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                ></path>
              </svg>
            </div>
            <h3 className="font-bold text-gray-800">View Tokens</h3>
            <p className="text-xs text-gray-400 mt-1">
              Check access & refresh tokens
            </p>
          </Link>

          <Link
            href="/simple"
            className="group p-5 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:ring-1 hover:ring-blue-500 transition-all text-left"
          >
            <div className="mb-3 w-8 h-8 bg-gray-100 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors flex items-center justify-center">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
            </div>
            <h3 className="font-bold text-gray-800">Simple Page</h3>
            <p className="text-xs text-gray-400 mt-1">Just a protected route</p>
          </Link>

          <div className="group p-5 bg-gray-50 border border-gray-200 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-not-allowed opacity-60">
            <h3 className="font-bold text-gray-400 text-sm">
              More Coming Soon
            </h3>
          </div>
        </div>
      </main>
    </div>
  );
}

// SSR Requirement for Middleware consistency & Token Fetching
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req } = context;
  const sessionToken = req.cookies["session_token"] || null;
  const refreshToken = req.cookies["refresh_token"] || null;

  return {
    props: {
      sessionToken,
      refreshToken,
    },
  };
};
